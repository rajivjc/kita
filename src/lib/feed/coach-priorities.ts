/**
 * Coach feed priority system — computes athlete status buckets.
 *
 * Groups athletes into: needs attention, going quiet, near milestone, on track.
 * Server-side only (uses adminClient). Called from Server Components.
 */

import { adminClient } from '@/lib/supabase/admin'
import { getMilestoneDefinitions } from '@/lib/feed/shared-queries'

// ─── Types ───────────────────────────────────────────────────────

export type AthleteStatus = {
  athleteId: string
  athleteName: string
  avatar: string | null
}

export type NeedsAttentionAthlete = AthleteStatus & {
  reason: 'declining_feel' | 'sudden_drop'
  detail: string
  recentFeelRatings: number[]
}

export type GoingQuietAthlete = AthleteStatus & {
  daysSinceLastSession: number
  averageCadenceDays: number
  lastSessionDate: string
}

export type NearMilestoneAthlete = AthleteStatus & {
  milestoneName: string
  current: number
  target: number
  unit: string
}

export type CoachPriorities = {
  needsAttention: NeedsAttentionAthlete[]
  goingQuiet: GoingQuietAthlete[]
  nearMilestone: NearMilestoneAthlete[]
  onTrack: AthleteStatus[]
  totalAthletes: number
  unmatchedStravaCount: number
}

// ─── Internal helpers (exported for testing) ─────────────────────

/**
 * Compute median of a sorted numeric array.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

/**
 * Compute "days since last session" using Asia/Singapore timezone.
 */
export function daysSince(dateStr: string, now?: Date): number {
  const todayStr = (now ?? new Date()).toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' })
  const todayMs = new Date(todayStr + 'T00:00:00').getTime()
  const dateOnly = dateStr.split('T')[0]
  const dateMs = new Date(dateOnly + 'T00:00:00').getTime()
  return Math.floor((todayMs - dateMs) / (1000 * 60 * 60 * 24))
}

// ─── Bucket computation (pure, exported for testing) ─────────────

type SessionRow = {
  athlete_id: string
  date: string
  feel: number | null
  distance_km: number | null
}

type AthleteRow = {
  id: string
  name: string
  avatar: string | null
}

export function computeNeedsAttention(
  athletes: AthleteRow[],
  sessionsByAthlete: Record<string, SessionRow[]>,
): NeedsAttentionAthlete[] {
  const results: NeedsAttentionAthlete[] = []
  const nameMap = Object.fromEntries(athletes.map(a => [a.id, a]))

  for (const [athleteId, sessions] of Object.entries(sessionsByAthlete)) {
    const athlete = nameMap[athleteId]
    if (!athlete) continue

    // Only sessions with feel ratings, sorted most recent last
    const withFeel = sessions
      .filter(s => s.feel != null)
      .sort((a, b) => a.date.localeCompare(b.date))

    if (withFeel.length < 3) continue

    const recentFeelRatings = withFeel.slice(-5).map(s => s.feel!)
    const last3 = withFeel.slice(-3).map(s => s.feel!)

    // Check sudden_drop first (higher priority)
    if (withFeel.length >= 6) {
      const lastFeel = withFeel[withFeel.length - 1].feel!
      const previousFive = withFeel.slice(-6, -1).map(s => s.feel!)
      const trailingAvg = previousFive.reduce((s, v) => s + v, 0) / previousFive.length
      if (trailingAvg - lastFeel >= 2) {
        results.push({
          athleteId,
          athleteName: athlete.name,
          avatar: athlete.avatar,
          reason: 'sudden_drop',
          detail: `Avg was ${Math.round(trailingAvg * 10) / 10}, last session rated ${lastFeel}`,
          recentFeelRatings,
        })
        continue // Don't double-flag
      }
    }

    // Check declining_feel: last 3 sessions ALL ≤ 2
    if (last3.every(f => f <= 2)) {
      results.push({
        athleteId,
        athleteName: athlete.name,
        avatar: athlete.avatar,
        reason: 'declining_feel',
        detail: `Last 3 sessions rated ${last3.join(', ')}`,
        recentFeelRatings,
      })
    }
  }

  // Sort: sudden_drop first, then by how low ratings are
  results.sort((a, b) => {
    if (a.reason !== b.reason) {
      return a.reason === 'sudden_drop' ? -1 : 1
    }
    const aMin = Math.min(...a.recentFeelRatings)
    const bMin = Math.min(...b.recentFeelRatings)
    return aMin - bMin
  })

  return results
}

export function computeGoingQuiet(
  athletes: AthleteRow[],
  sessionsByAthlete: Record<string, SessionRow[]>,
  now?: Date,
): GoingQuietAthlete[] {
  const results: GoingQuietAthlete[] = []
  const nameMap = Object.fromEntries(athletes.map(a => [a.id, a]))

  for (const [athleteId, sessions] of Object.entries(sessionsByAthlete)) {
    const athlete = nameMap[athleteId]
    if (!athlete) continue
    if (sessions.length < 3) continue

    // Sort by date ascending
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))

    // Use last 10 sessions for cadence calculation
    const recent = sorted.slice(-10)
    const lastSession = sorted[sorted.length - 1]
    const days = daysSince(lastSession.date, now)

    // Must be at least 14 days since last session
    if (days < 14) continue

    // Compute gaps between consecutive sessions
    const gaps: number[] = []
    for (let i = 1; i < recent.length; i++) {
      const prevMs = new Date(recent[i - 1].date.split('T')[0] + 'T00:00:00').getTime()
      const currMs = new Date(recent[i].date.split('T')[0] + 'T00:00:00').getTime()
      const gap = Math.round((currMs - prevMs) / (1000 * 60 * 60 * 24))
      if (gap > 0) gaps.push(gap)
    }

    if (gaps.length === 0) continue

    const avgCadence = median(gaps)
    if (avgCadence <= 0) continue

    // Flag if absence exceeds 2× their cadence
    if (days >= avgCadence * 2) {
      const dateStr = new Date(lastSession.date.split('T')[0] + 'T00:00:00+08:00')
        .toLocaleDateString('en-SG', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'Asia/Singapore',
        })

      results.push({
        athleteId,
        athleteName: athlete.name,
        avatar: athlete.avatar,
        daysSinceLastSession: days,
        averageCadenceDays: Math.round(avgCadence * 10) / 10,
        lastSessionDate: dateStr,
      })
    }
  }

  // Sort: longest absence first
  results.sort((a, b) => b.daysSinceLastSession - a.daysSinceLastSession)

  return results
}

export function computeNearMilestone(
  athletes: AthleteRow[],
  sessionsByAthlete: Record<string, SessionRow[]>,
  earnedMilestonesByAthlete: Record<string, Set<string>>,
  milestoneDefs: { id: string; label: string; icon: string; condition: { metric?: string; threshold?: number } | null }[],
): NearMilestoneAthlete[] {
  const results: NearMilestoneAthlete[] = []
  const nameMap = Object.fromEntries(athletes.map(a => [a.id, a]))

  for (const athlete of athletes) {
    const sessions = sessionsByAthlete[athlete.id] ?? []
    const earned = earnedMilestonesByAthlete[athlete.id] ?? new Set()

    const sessionCount = sessions.length
    const totalDistanceKm = sessions.reduce((sum, s) => sum + (s.distance_km ?? 0), 0)
    const longestRun = sessions.reduce((max, s) => Math.max(max, s.distance_km ?? 0), 0)

    for (const def of milestoneDefs) {
      if (earned.has(def.id)) continue
      const condition = def.condition
      if (!condition?.metric || condition.threshold == null) continue

      let current: number
      let unit: string

      switch (condition.metric) {
        case 'session_count':
          current = sessionCount
          unit = 'sessions'
          break
        case 'distance_km':
          current = Math.round(totalDistanceKm * 10) / 10
          unit = 'km'
          break
        case 'longest_run':
          current = Math.round(longestRun * 10) / 10
          unit = 'km'
          break
        default:
          continue
      }

      const target = condition.threshold
      if (current >= target) continue // Already past (maybe earned elsewhere)

      const gap = target - current
      const tenPercent = target * 0.1

      // Within 10% OR within 3 units
      if (gap <= tenPercent || gap <= 3) {
        results.push({
          athleteId: athlete.id,
          athleteName: athlete.name,
          avatar: athlete.avatar,
          milestoneName: def.label,
          current,
          target,
          unit,
        })
      }
    }
  }

  // Sort: closest to milestone first (by percentage remaining)
  results.sort((a, b) => {
    const aRatio = (a.target - a.current) / a.target
    const bRatio = (b.target - b.current) / b.target
    return aRatio - bRatio
  })

  return results
}

// ─── Main function ───────────────────────────────────────────────

export async function getCoachPriorities(coachId: string): Promise<CoachPriorities> {
  // Batch 1: athletes, all completed sessions, milestone data, unmatched Strava
  const [
    { data: athleteRows },
    { data: sessionRows },
    milestoneDefs,
    { data: earnedRows },
    { count: unmatchedCount },
  ] = await Promise.all([
    adminClient
      .from('athletes')
      .select('id, name, avatar')
      .eq('active', true),
    adminClient
      .from('sessions')
      .select('athlete_id, date, feel, distance_km')
      .eq('status', 'completed')
      .is('strava_deleted_at', null)
      .order('date', { ascending: true }),
    getMilestoneDefinitions(),
    adminClient
      .from('milestones')
      .select('athlete_id, milestone_definition_id'),
    adminClient
      .from('strava_unmatched')
      .select('*', { count: 'exact', head: true })
      .is('resolution_type', null),
  ])

  const athletes = (athleteRows ?? []) as AthleteRow[]
  const sessions = (sessionRows ?? []) as SessionRow[]

  if (athletes.length === 0) {
    return {
      needsAttention: [],
      goingQuiet: [],
      nearMilestone: [],
      onTrack: [],
      totalAthletes: 0,
      unmatchedStravaCount: unmatchedCount ?? 0,
    }
  }

  // Group sessions by athlete (only active athletes)
  const activeIds = new Set(athletes.map(a => a.id))
  const sessionsByAthlete: Record<string, SessionRow[]> = {}
  for (const s of sessions) {
    if (!activeIds.has(s.athlete_id)) continue
    if (!sessionsByAthlete[s.athlete_id]) sessionsByAthlete[s.athlete_id] = []
    sessionsByAthlete[s.athlete_id].push(s)
  }

  // Group earned milestones by athlete
  const earnedMilestonesByAthlete: Record<string, Set<string>> = {}
  for (const m of earnedRows ?? []) {
    if (!earnedMilestonesByAthlete[m.athlete_id]) {
      earnedMilestonesByAthlete[m.athlete_id] = new Set()
    }
    if (m.milestone_definition_id) {
      earnedMilestonesByAthlete[m.athlete_id].add(m.milestone_definition_id)
    }
  }

  // Compute buckets
  const needsAttention = computeNeedsAttention(athletes, sessionsByAthlete)
  const goingQuiet = computeGoingQuiet(athletes, sessionsByAthlete)
  const nearMilestone = computeNearMilestone(
    athletes,
    sessionsByAthlete,
    earnedMilestonesByAthlete,
    milestoneDefs,
  )

  // On track = everyone not in another bucket
  const flaggedIds = new Set([
    ...needsAttention.map(a => a.athleteId),
    ...goingQuiet.map(a => a.athleteId),
    ...nearMilestone.map(a => a.athleteId),
  ])

  const onTrack: AthleteStatus[] = athletes
    .filter(a => !flaggedIds.has(a.id))
    .map(a => ({ athleteId: a.id, athleteName: a.name, avatar: a.avatar }))
    .sort((a, b) => a.athleteName.localeCompare(b.athleteName))

  return {
    needsAttention,
    goingQuiet,
    nearMilestone,
    onTrack,
    totalAthletes: athletes.length,
    unmatchedStravaCount: unmatchedCount ?? 0,
  }
}
