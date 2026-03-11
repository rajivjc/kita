-- Athlete preferences (color theme, goal choice)
ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS theme_color text DEFAULT 'teal',
  ADD COLUMN IF NOT EXISTS athlete_goal_choice text CHECK (athlete_goal_choice IN ('run_further', 'run_more', 'feel_stronger'));

-- Athlete moods (separate from coach feel rating — this is the athlete's voice)
CREATE TABLE IF NOT EXISTS athlete_moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  mood smallint NOT NULL CHECK (mood BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_athlete_moods_athlete ON athlete_moods(athlete_id, created_at DESC);

-- Athlete favorite runs (heart toggle)
CREATE TABLE IF NOT EXISTS athlete_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(athlete_id, session_id)
);

-- RLS: enabled but service role (adminClient) bypasses it
ALTER TABLE athlete_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_favorites ENABLE ROW LEVEL SECURITY;
