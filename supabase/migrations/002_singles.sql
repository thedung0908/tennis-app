CREATE TABLE singles_matches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE NOT NULL,
  player1_id UUID NOT NULL REFERENCES members(id),
  player2_id UUID NOT NULL REFERENCES members(id),
  score1     INTEGER NOT NULL,
  score2     INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT singles_valid_score CHECK (
    (score1 = 6 AND score2 IN (0,1,2,3,4)) OR
    (score2 = 6 AND score1 IN (0,1,2,3,4)) OR
    (score1 = 5 AND score2 = 5)
  ),
  CONSTRAINT singles_different_players CHECK (player1_id <> player2_id)
);

CREATE INDEX singles_matches_date_idx ON singles_matches (date);

ALTER TABLE singles_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_singles" ON singles_matches FOR ALL TO anon USING (true) WITH CHECK (true);
