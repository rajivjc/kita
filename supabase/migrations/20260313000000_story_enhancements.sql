-- Story enhancements: coach note story inclusion + story updates table

-- A. Add include_in_story flag to coach_notes
ALTER TABLE coach_notes
  ADD COLUMN include_in_story boolean NOT NULL DEFAULT false;

CREATE INDEX idx_coach_notes_story
  ON coach_notes(athlete_id, include_in_story)
  WHERE include_in_story = true AND visibility = 'all';

-- B. Create story_updates table for coach-authored periodic updates
CREATE TABLE story_updates (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      uuid        NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  coach_user_id   uuid        REFERENCES users(id) ON DELETE SET NULL,
  content         text        NOT NULL CHECK (char_length(content) <= 500),
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE story_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage story updates"
  ON story_updates FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Public can read story updates for shared athletes"
  ON story_updates FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM athletes WHERE id = athlete_id AND allow_public_sharing = true)
  );

CREATE INDEX idx_story_updates_athlete ON story_updates(athlete_id, created_at DESC);
