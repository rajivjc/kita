'use server'

import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export type ExportSession = {
  date: string
  distance_km: number
  duration_min: number
  pace_min_km: string
  feel_rating: number | null
  coach_notes: string
  source: 'manual' | 'strava'
}

type ExportResult =
  | { data: ExportSession[]; athleteName: string; error?: undefined }
  | { error: string; data?: undefined; athleteName?: undefined }

export async function getExportData(athleteId: string): Promise<ExportResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Your session has expired. Please sign in again.' }

  const { data: userRow } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userRow || userRow.role === 'caregiver') {
    return { error: 'Unauthorized' }
  }

  const { data: athlete } = await adminClient
    .from('athletes')
    .select('name')
    .eq('id', athleteId)
    .single()

  if (!athlete) return { error: 'Athlete not found' }

  const { data: sessions, error } = await adminClient
    .from('sessions')
    .select('date, distance_km, duration_seconds, feel, note, sync_source')
    .eq('athlete_id', athleteId)
    .is('strava_deleted_at', null)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return { error: 'Could not fetch session data. Please try again.' }

  const SGT = 'Asia/Singapore'

  const formatted: ExportSession[] = (sessions ?? []).map((s: any) => {
    const distKm = s.distance_km ?? 0
    const durationSec = s.duration_seconds ?? 0
    const durationMin = Math.round(durationSec / 60)

    let pace = ''
    if (distKm > 0 && durationSec > 0) {
      const paceSeconds = durationSec / distKm
      const mins = Math.floor(paceSeconds / 60)
      const secs = Math.round(paceSeconds % 60)
      pace = `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const d = new Date(s.date)
    let dateStr = ''
    if (!isNaN(d.getTime())) {
      dateStr = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: SGT,
      }).format(d)
    }

    const source: 'manual' | 'strava' = s.sync_source === 'strava_webhook' ? 'strava' : 'manual'

    return {
      date: dateStr,
      distance_km: Math.round(distKm * 100) / 100,
      duration_min: durationMin,
      pace_min_km: pace,
      feel_rating: s.feel ?? null,
      coach_notes: s.note ?? '',
      source,
    }
  })

  return { data: formatted, athleteName: athlete.name }
}
