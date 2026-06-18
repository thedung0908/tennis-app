# Data Model — Database Schema

## 1. Tổng quan

Database: **PostgreSQL** (Supabase). Điểm và tiền **không lưu** — tính realtime từ bảng `matches` và `singles_matches`.

Migrations:
- `supabase/migrations/001_init.sql` — bảng `members`, `matches`, sample data
- `supabase/migrations/002_singles.sql` — bảng `singles_matches`

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
| `name` | TEXT | Tên thành viên, phải duy nhất (cho phép chữ thường) |
| `created_at` | TIMESTAMPTZ | Thời điểm thêm vào |

---

### 2.2 `matches` — Kết quả trận đôi

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

---

### 2.3 `singles_matches` — Kết quả trận đơn

```sql
CREATE TABLE singles_matches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE NOT NULL,
  player1_id UUID NOT NULL REFERENCES members(id),
  player2_id UUID NOT NULL REFERENCES members(id),
  score1     INTEGER NOT NULL,  -- games của player 1
  score2     INTEGER NOT NULL,  -- games của player 2
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT singles_valid_score CHECK (
    (score1 = 6 AND score2 IN (0,1,2,3,4)) OR
    (score2 = 6 AND score1 IN (0,1,2,3,4)) OR
    (score1 = 5 AND score2 = 5)
  ),

  CONSTRAINT singles_different_players CHECK (player1_id <> player2_id)
);
```

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | UUID | Khóa chính |
| `date` | DATE | Ngày thi đấu |
| `player1_id` | UUID | Người chơi 1 |
| `player2_id` | UUID | Người chơi 2 |
| `score1` | INTEGER | Số game người 1 ghi (0–6) |
| `score2` | INTEGER | Số game người 2 ghi (0–6) |
| `created_at` | TIMESTAMPTZ | Thời điểm nhập |

---

## 3. Indexes

```sql
CREATE INDEX matches_date_idx ON matches (date);
CREATE INDEX singles_matches_date_idx ON singles_matches (date);
```

---

## 4. Computed Queries

Các query sau dùng trong app. Thay `$start` / `$end` bằng ngày đầu và cuối của kỳ cần tính.

**Lưu ý**: Trong code, các query được bọc bằng `unstable_cache` trong `lib/queries.ts` với tag-based invalidation, không gọi Supabase trực tiếp từ pages.

### 4.1 Query Xếp hạng — Đôi (Ranking)

```sql
WITH player_stats AS (
  SELECT team1_p1_id AS player_id, score1 AS points,
         CASE WHEN score1 > score2 THEN 1 ELSE 0 END AS win,
         CASE WHEN score1 = score2 THEN 1 ELSE 0 END AS draw
  FROM matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT team1_p2_id, score1, ...
  UNION ALL
  SELECT team2_p1_id, score2, ...
  UNION ALL
  SELECT team2_p2_id, score2, ...
)
SELECT m.id, m.name,
  COUNT(*)                                        AS matches_played,
  SUM(ps.points)                                  AS total_points,
  ROUND(SUM(ps.points)::numeric / COUNT(*), 2)    AS avg_points,
  SUM(ps.win) AS wins, SUM(ps.draw) AS draws,
  COUNT(*) - SUM(ps.win) - SUM(ps.draw)           AS losses
FROM player_stats ps JOIN members m ON m.id = ps.player_id
GROUP BY m.id, m.name
ORDER BY avg_points DESC, total_points DESC, matches_played ASC;
```

### 4.2 Query Xếp hạng — Đơn

Tương tự nhưng từ bảng `singles_matches`, chỉ 2 player thay vì 4:

```sql
WITH player_stats AS (
  SELECT player1_id AS player_id, score1 AS points,
         CASE WHEN score1 > score2 THEN 1 ELSE 0 END AS win,
         CASE WHEN score1 = score2 THEN 1 ELSE 0 END AS draw
  FROM singles_matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT player2_id, score2,
         CASE WHEN score2 > score1 THEN 1 ELSE 0 END,
         CASE WHEN score1 = score2 THEN 1 ELSE 0 END
  FROM singles_matches WHERE date BETWEEN $start AND $end
)
-- (GROUP BY + ORDER BY giống như doubles)
```

### 4.3 Query Tài chính — Đôi

```sql
WITH player_money AS (
  SELECT team1_p1_id AS player_id,
         CASE
           WHEN score1 = 5 AND score2 = 5 THEN 10000
           WHEN score1 < score2            THEN (score2 - score1) * 10000
           ELSE 0
         END AS money_owed
  FROM matches WHERE date BETWEEN $start AND $end
  -- UNION ALL cho team1_p2_id, team2_p1_id, team2_p2_id
)
SELECT m.id, m.name, SUM(pm.money_owed) AS total_money
FROM player_money pm JOIN members m ON m.id = pm.player_id
GROUP BY m.id, m.name ORDER BY total_money DESC;
```

### 4.4 Query Tài chính — Đơn

Tương tự nhưng từ `singles_matches`, công thức tiền giống hệt đôi (không chia per-person vì đã là 1 người):

```sql
WITH player_money AS (
  SELECT player1_id AS player_id,
         CASE
           WHEN score1 = 5 AND score2 = 5 THEN 10000
           WHEN score1 < score2            THEN (score2 - score1) * 10000
           ELSE 0
         END AS money_owed
  FROM singles_matches WHERE date BETWEEN $start AND $end
  UNION ALL
  SELECT player2_id,
         CASE
           WHEN score1 = 5 AND score2 = 5 THEN 10000
           WHEN score2 < score1            THEN (score1 - score2) * 10000
           ELSE 0
         END
  FROM singles_matches WHERE date BETWEEN $start AND $end
)
SELECT m.id, m.name, SUM(pm.money_owed) AS total_money
FROM player_money pm JOIN members m ON m.id = pm.player_id
GROUP BY m.id, m.name ORDER BY total_money DESC;
```

---

## 5. Row-Level Security (Supabase RLS)

```sql
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE singles_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_members" ON members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_matches" ON matches FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_singles" ON singles_matches FOR ALL TO anon USING (true) WITH CHECK (true);
```

---

## 6. Sample Data

```sql
-- Thêm thành viên mẫu
INSERT INTO members (name) VALUES
  ('CHƯƠNG'), ('KIÊN'), ('TIẾN'), ('DŨNG'),
  ('HÀ'), ('HƯNG'), ('HẢI'), ('TÙNG');

-- Trận đôi mẫu ngày 27/08
INSERT INTO matches (date, team1_p1_id, team1_p2_id, team2_p1_id, team2_p2_id, score1, score2)
SELECT '2024-08-27',
  (SELECT id FROM members WHERE name = 'CHƯƠNG'),
  (SELECT id FROM members WHERE name = 'KIÊN'),
  (SELECT id FROM members WHERE name = 'TIẾN'),
  (SELECT id FROM members WHERE name = 'DŨNG'),
  6, 3;
```
