-- Performance indexes for commonly queried columns
-- These indexes target the most frequent query patterns across feed, athlete detail,
-- Strava sync, and notification queries.

-- sessions: filtered by athlete_id + status, sorted by date DESC (feed, athlete detail, sync)
CREATE INDEX IF NOT EXISTS idx_sessions_athlete_status_date
  ON sessions (athlete_id, status, date DESC);

-- sessions: filtered by coach + date range (coach card on feed page)
CREATE INDEX IF NOT EXISTS idx_sessions_coach_status_date
  ON sessions (coach_user_id, status, date DESC);

-- notifications: filtered by user_id + read + type (sync pipeline, notification panel)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_type
  ON notifications (user_id, read, type);

-- coach_notes: filtered by athlete_id, sorted by created_at DESC (athlete detail notes tab)
CREATE INDEX IF NOT EXISTS idx_coach_notes_athlete_created
  ON coach_notes (athlete_id, created_at DESC);

-- milestones: filtered by athlete_id, sorted by achieved_at DESC (athlete detail, feed)
CREATE INDEX IF NOT EXISTS idx_milestones_athlete_achieved
  ON milestones (athlete_id, achieved_at DESC);

-- strava_sync_log: filtered by strava_activity_id + status (duplicate detection)
CREATE INDEX IF NOT EXISTS idx_strava_sync_log_activity_status
  ON strava_sync_log (strava_activity_id, status);
