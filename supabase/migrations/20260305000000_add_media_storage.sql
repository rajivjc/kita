-- ── Add columns to media table for storage-backed photos ──────────────────────

ALTER TABLE media
  ADD COLUMN IF NOT EXISTS source      text DEFAULT 'upload',
  ADD COLUMN IF NOT EXISTS storage_path text;

-- Index for fast session-photo lookups
CREATE INDEX IF NOT EXISTS idx_media_session_id  ON media(session_id);

-- Index for fast athlete album queries
CREATE INDEX IF NOT EXISTS idx_media_athlete_id_created ON media(athlete_id, created_at DESC);

-- ── Supabase Storage bucket (private — signed URLs only) ─────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('athlete-media', 'athlete-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: coaches and admins can upload
CREATE POLICY "athlete_media_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'athlete-media'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'coach')
  );

-- Storage RLS: authenticated users can read (signed URLs generated server-side)
CREATE POLICY "athlete_media_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'athlete-media');

-- Storage RLS: coaches and admins can delete their uploads
CREATE POLICY "athlete_media_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'athlete-media'
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'coach')
  );
