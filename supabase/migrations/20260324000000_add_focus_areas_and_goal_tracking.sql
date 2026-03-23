-- Focus areas: coach-set training focuses per athlete
-- Only ONE active focus per athlete at a time (enforced in app logic, not DB constraint)
CREATE TABLE IF NOT EXISTS public.focus_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  title text NOT NULL,
  progress_note text,
  progress_level text CHECK (progress_level IN ('just_started', 'making_progress', 'almost_there', 'achieved')) DEFAULT 'just_started',
  status text CHECK (status IN ('active', 'achieved', 'paused')) DEFAULT 'active',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  achieved_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.focus_areas ENABLE ROW LEVEL SECURITY;

-- Coaches and admins can do everything
CREATE POLICY "Coaches and admins manage focus areas"
  ON public.focus_areas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'coach') AND active = true
    )
  );

-- Caregivers can read focus areas for their linked athlete
CREATE POLICY "Caregivers read linked athlete focus areas"
  ON public.focus_areas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.athletes a
      JOIN public.users u ON u.id = auth.uid()
      WHERE a.id = focus_areas.athlete_id
        AND a.caregiver_user_id = auth.uid()
        AND u.role = 'caregiver'
        AND u.active = true
    )
  );

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_focus_areas_athlete_status ON public.focus_areas(athlete_id, status);

-- Track when athlete changes their self-picked goal + store previous
ALTER TABLE public.athletes
  ADD COLUMN IF NOT EXISTS goal_choice_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS previous_goal_choice text CHECK (previous_goal_choice IN ('run_further', 'run_more', 'feel_stronger')),
  ADD COLUMN IF NOT EXISTS previous_goal_choice_at timestamptz;

-- Migrate existing working_on data to focus_areas
-- For each athlete that has a working_on value, create an active focus_area
INSERT INTO public.focus_areas (athlete_id, title, progress_note, progress_level, status, created_by, created_at, updated_at)
SELECT
  a.id,
  a.working_on,
  a.recent_progress,
  'making_progress',
  'active',
  a.working_on_updated_by,
  COALESCE(a.working_on_updated_at, now()),
  COALESCE(a.working_on_updated_at, now())
FROM public.athletes a
WHERE a.working_on IS NOT NULL AND a.working_on != '';
