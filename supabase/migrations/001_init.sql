-- Tạo bảng members
CREATE TABLE members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT members_name_unique UNIQUE (name)
);

-- Tạo bảng matches
CREATE TABLE matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE NOT NULL,
  team1_p1_id  UUID NOT NULL REFERENCES members(id),
  team1_p2_id  UUID NOT NULL REFERENCES members(id),
  team2_p1_id  UUID NOT NULL REFERENCES members(id),
  team2_p2_id  UUID NOT NULL REFERENCES members(id),
  score1       INTEGER NOT NULL,
  score2       INTEGER NOT NULL,
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

CREATE INDEX matches_date_idx ON matches (date);

-- RLS: cho phép tất cả thao tác từ anon key (auth được xử lý ở Next.js Server Actions)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_members" ON members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_matches" ON matches FOR ALL TO anon USING (true) WITH CHECK (true);

-- Sample data
INSERT INTO members (name) VALUES
  ('CHƯƠNG'), ('KIÊN'), ('TIẾN'), ('DŨNG'),
  ('HÀ'), ('HƯNG'), ('HẢI'), ('TÙNG');

INSERT INTO matches (date, team1_p1_id, team1_p2_id, team2_p1_id, team2_p2_id, score1, score2)
SELECT '2024-08-27',
  (SELECT id FROM members WHERE name = 'CHƯƠNG'),
  (SELECT id FROM members WHERE name = 'KIÊN'),
  (SELECT id FROM members WHERE name = 'TIẾN'),
  (SELECT id FROM members WHERE name = 'DŨNG'),
  6, 3;

INSERT INTO matches (date, team1_p1_id, team1_p2_id, team2_p1_id, team2_p2_id, score1, score2)
SELECT '2024-08-27',
  (SELECT id FROM members WHERE name = 'CHƯƠNG'),
  (SELECT id FROM members WHERE name = 'HƯNG'),
  (SELECT id FROM members WHERE name = 'HÀ'),
  (SELECT id FROM members WHERE name = 'DŨNG'),
  2, 6;

INSERT INTO matches (date, team1_p1_id, team1_p2_id, team2_p1_id, team2_p2_id, score1, score2)
SELECT '2024-08-27',
  (SELECT id FROM members WHERE name = 'HÀ'),
  (SELECT id FROM members WHERE name = 'HƯNG'),
  (SELECT id FROM members WHERE name = 'KIÊN'),
  (SELECT id FROM members WHERE name = 'CHƯƠNG'),
  6, 3;
