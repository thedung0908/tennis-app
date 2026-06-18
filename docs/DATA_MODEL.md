# Data Model — Database Schema

## 1. Tổng quan

Database: **PostgreSQL** (Supabase). Điểm và tiền **không lưu** — tính realtime từ bảng `matches`.

---

## 2. Tables

### 2.1 `members` — Danh sách thành viên

```sql
CREATE TABLE members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT members_name_unique UNIQUE (name)
);
```

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | UUID | Khóa chính |
| `name` | TEXT | Tên thành viên, phải duy nhất |
| `created_at` | TIMESTAMPTZ | Thời điểm thêm vào |

---

### 2.2 `matches` — Kết quả trận đấu

```sql
CREATE TABLE matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE NOT NULL,
  team1_p1_id  UUID NOT NULL REFERENCES members(id),
  team1_p2_id  UUID NOT NULL REFERENCES members(id),
  team2_p1_id  UUID NOT NULL REFERENCES members(id),
  team2_p2_id  UUID NOT NULL REFERENCES members(id),
  score1       INTEGER NOT NULL,  -- games của Team 1
  score2       INTEGER NOT NULL,  -- games của Team 2
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_score CHECK (
    (score1 = 6 AND score2 IN (0,1,2,3,4)) OR
    (score2 = 6 AND score1 IN (0,1,2,3,4)) OR
    (score1 = 5 AND score2 = 5)
  ),

  CONSTRAINT no_duplicate_players CHECK (
    team1_p1_id <> team1_p2_id AND
    team1_p1_id <> team2_p1_id AND
    team1_p1_id <> team2_p2_id AND
    team1_p2_id <> team2_p1_id AND
    team1_p2_id <> team2_p2_id AND
    team2_p1_id <> team2_p2_id
  )
);
```

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | UUID | Khóa chính |
| `date` | DATE | Ngày thi đấu |
| `team1_p1_id` | UUID | Người 1 của Đội 1 |
| `team1_p2_id` | UUID | Người 2 của Đội 1 |
| `team2_p1_id` | UUID | Người 1 của Đội 2 |
| `team2_p2_id` | UUID | Người 2 của Đội 2 |
| `score1` | INTEGER | Số game Đội 1 ghi (0–6) |
| `score2` | INTEGER | Số game Đội 2 ghi (0–6) |
| `created_at` | TIMESTAMPTZ | Thời điểm nhập |

---

## 3. Indexes

```sql
CREATE INDEX matches_date_idx ON matches (date);
```

---

## 4. Computed Queries

Các query sau dùng trong app. Thay `$start` / `$end` bằng ngày đầu và cuối của kỳ cần tính.

### 4.1 Query Xếp hạng (Ranking)

```sql
WITH player_stats AS (
  SELECT team1_p1_id AS player_id, score1 AS points,
         CASE WHEN score1 > score2 THEN 1 ELSE 0 END AS win,
         CASE WHEN score1 = score2 THEN 1 ELSE 0 END AS draw
  FROM matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT team1_p2_id, score1,
         CASE WHEN score1 > score2 THEN 1 ELSE 0 END,
         CASE WHEN score1 = score2 THEN 1 ELSE 0 END
  FROM matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT team2_p1_id, score2,
         CASE WHEN score2 > score1 THEN 1 ELSE 0 END,
         CASE WHEN score1 = score2 THEN 1 ELSE 0 END
  FROM matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT team2_p2_id, score2,
         CASE WHEN score2 > score1 THEN 1 ELSE 0 END,
         CASE WHEN score1 = score2 THEN 1 ELSE 0 END
  FROM matches WHERE date BETWEEN $start AND $end
)
SELECT
  m.id,
  m.name,
  COUNT(*)                                          AS matches_played,
  SUM(ps.points)                                    AS total_points,
  ROUND(SUM(ps.points)::numeric / COUNT(*), 2)      AS avg_points,
  SUM(ps.win)                                       AS wins,
  SUM(ps.draw)                                      AS draws,
  COUNT(*) - SUM(ps.win) - SUM(ps.draw)             AS losses
FROM player_stats ps
JOIN members m ON m.id = ps.player_id
GROUP BY m.id, m.name
ORDER BY avg_points DESC, total_points DESC, matches_played ASC;
```

### 4.2 Query Tài chính (Finance)

```sql
WITH player_money AS (
  SELECT team1_p1_id AS player_id,
         CASE
           WHEN score1 = 5 AND score2 = 5 THEN 10000
           WHEN score1 < score2            THEN (score2 - score1) * 10000
           ELSE 0
         END AS money_owed
  FROM matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT team1_p2_id,
         CASE
           WHEN score1 = 5 AND score2 = 5 THEN 10000
           WHEN score1 < score2            THEN (score2 - score1) * 10000
           ELSE 0
         END
  FROM matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT team2_p1_id,
         CASE
           WHEN score1 = 5 AND score2 = 5 THEN 10000
           WHEN score2 < score1            THEN (score1 - score2) * 10000
           ELSE 0
         END
  FROM matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT team2_p2_id,
         CASE
           WHEN score1 = 5 AND score2 = 5 THEN 10000
           WHEN score2 < score1            THEN (score1 - score2) * 10000
           ELSE 0
         END
  FROM matches WHERE date BETWEEN $start AND $end
)
SELECT
  m.id,
  m.name,
  SUM(pm.money_owed) AS total_money
FROM player_money pm
JOIN members m ON m.id = pm.player_id
GROUP BY m.id, m.name
ORDER BY total_money DESC;
```

### 4.3 Query Time-series — Điểm TB tích lũy (dùng cho Line chart)

Trục X là ngày thi đấu (monthly view) hoặc tháng (quarterly view). Mỗi điểm trên đường là điểm TB tích lũy tính từ đầu kỳ đến ngày/tháng đó.

```sql
-- Monthly view: trục X là từng ngày có trận trong kỳ
WITH player_match AS (
  SELECT date, team1_p1_id AS player_id, score1 AS points
  FROM matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT date, team1_p2_id, score1
  FROM matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT date, team2_p1_id, score2
  FROM matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT date, team2_p2_id, score2
  FROM matches WHERE date BETWEEN $start AND $end
),
daily_agg AS (
  SELECT player_id, date,
         SUM(points) AS day_points,
         COUNT(*)    AS day_matches
  FROM player_match
  GROUP BY player_id, date
)
SELECT
  d.date,
  m.name,
  SUM(d.day_points)   OVER w                          AS cum_points,
  SUM(d.day_matches)  OVER w                          AS cum_matches,
  ROUND(
    SUM(d.day_points)::numeric  OVER w /
    SUM(d.day_matches)          OVER w,
    2
  )                                                    AS cum_avg
FROM daily_agg d
JOIN members m ON m.id = d.player_id
WINDOW w AS (PARTITION BY d.player_id ORDER BY d.date ROWS UNBOUNDED PRECEDING)
ORDER BY d.date, m.name;
```

```sql
-- Quarterly view: trục X là từng tháng trong quý
-- Thay date_trunc('month', date) cho trục X, giữ nguyên logic tích lũy
WITH player_match AS (
  -- (giống trên, filter date BETWEEN $start AND $end)
  ...
),
monthly_agg AS (
  SELECT player_id,
         DATE_TRUNC('month', date) AS month,
         SUM(points)  AS mo_points,
         COUNT(*)     AS mo_matches
  FROM player_match
  GROUP BY player_id, DATE_TRUNC('month', date)
)
SELECT
  ma.month,
  m.name,
  SUM(ma.mo_points)   OVER w AS cum_points,
  SUM(ma.mo_matches)  OVER w AS cum_matches,
  ROUND(SUM(ma.mo_points)::numeric OVER w / SUM(ma.mo_matches) OVER w, 2) AS cum_avg
FROM monthly_agg ma
JOIN members m ON m.id = ma.player_id
WINDOW w AS (PARTITION BY ma.player_id ORDER BY ma.month ROWS UNBOUNDED PRECEDING)
ORDER BY ma.month, m.name;
```

**Kết quả trả về** (dùng cho Recharts):
```typescript
// Chuyển đổi trong lib/calculations.ts sang dạng Recharts hiểu được
type TimeSeriesPoint = {
  date: string;          // "2024-08-10" hoặc "2024-08-01" (đầu tháng)
  [memberName: string]: number | string;  // e.g. HÀ: 5.60, CHƯƠNG: 4.50
};
```

---

## 5. Row-Level Security (Supabase RLS)

Không có auth → cho phép tất cả thao tác từ anon key:

```sql
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_members" ON members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_matches" ON matches FOR ALL TO anon USING (true) WITH CHECK (true);
```

---

## 6. Sample Data

```sql
-- Thêm thành viên mẫu
INSERT INTO members (name) VALUES
  ('CHƯƠNG'), ('KIÊN'), ('TIẾN'), ('DŨNG'),
  ('HÀ'), ('HƯNG'), ('HẢI'), ('TÙNG');

-- Trận mẫu ngày 27/08 (từ BUSINESS_LOGIC.md §6)
INSERT INTO matches (date, team1_p1_id, team1_p2_id, team2_p1_id, team2_p2_id, score1, score2)
SELECT
  '2024-08-27',
  (SELECT id FROM members WHERE name = 'CHƯƠNG'),
  (SELECT id FROM members WHERE name = 'KIÊN'),
  (SELECT id FROM members WHERE name = 'TIẾN'),
  (SELECT id FROM members WHERE name = 'DŨNG'),
  6, 3;

INSERT INTO matches (date, team1_p1_id, team1_p2_id, team2_p1_id, team2_p2_id, score1, score2)
SELECT
  '2024-08-27',
  (SELECT id FROM members WHERE name = 'CHƯƠNG'),
  (SELECT id FROM members WHERE name = 'HƯNG'),
  (SELECT id FROM members WHERE name = 'HÀ'),
  (SELECT id FROM members WHERE name = 'DŨNG'),
  2, 6;

INSERT INTO matches (date, team1_p1_id, team1_p2_id, team2_p1_id, team2_p2_id, score1, score2)
SELECT
  '2024-08-27',
  (SELECT id FROM members WHERE name = 'HÀ'),
  (SELECT id FROM members WHERE name = 'HƯNG'),
  (SELECT id FROM members WHERE name = 'KIÊN'),
  (SELECT id FROM members WHERE name = 'CHƯƠNG'),
  6, 3;
```
