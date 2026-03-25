/**
 * Training session push notification helpers.
 *
 * Each function checks users.session_notifications before sending.
 * Quiet hours are handled by sendPushToUser().
 * Caregiver notifications are batched: ONE per caregiver listing all their athletes.
 */

import { adminClient } from '@/lib/supabase/admin'
import { sendPushToUser } from '@/lib/push'
import { getClub } from '@/lib/club'
import { formatSessionDate, formatSessionTime } from '@/lib/sessions/datetime'

// ── Helpers ─────────────────────────────────────────────────────────────

async function getSessionWithClub(sessionId: string) {
  const [{ data: session }, club] = await Promise.all([
    adminClient
      .from('training_sessions')
      .select('id, title, session_start, session_end, location, status')
      .eq('id', sessionId)
      .single(),
    getClub(),
  ])
  return { session, club }
}

/** Get users who have session_notifications enabled for given user IDs */
async function filterNotifiable(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set()
  const { data } = await adminClient
    .from('users')
    .select('id')
    .in('id', userIds)
    .eq('session_notifications', true)
    .eq('active', true)
  return new Set((data ?? []).map(u => u.id))
}

function sessionLabel(session: { title: string | null; session_start: string; location: string }, timezone: string) {
  const title = session.title ?? 'Training'
  const date = formatSessionDate(session.session_start, timezone)
  const time = formatSessionTime(session.session_start, timezone)
  return { title, date, time, location: session.location }
}

// ── notifySessionPublished ──────────────────────────────────────────────

export async function notifySessionPublished(sessionId: string): Promise<void> {
  const { session, club } = await getSessionWithClub(sessionId)
  if (!session) return

  const label = sessionLabel(session, club.timezone)

  // Get all active coaches and caregivers
  const [{ data: coaches }, { data: caregivers }] = await Promise.all([
    adminClient.from('users').select('id').eq('role', 'coach').eq('active', true),
    adminClient.from('users').select('id').eq('role', 'caregiver').eq('active', true),
  ])

  const allUserIds = [
    ...(coaches ?? []).map(c => c.id),
    ...(caregivers ?? []).map(c => c.id),
  ]
  const notifiable = await filterNotifiable(allUserIds)

  // Send to coaches — one per coach
  const coachPromises = (coaches ?? [])
    .filter(c => notifiable.has(c.id))
    .map(c =>
      sendPushToUser(c.id, {
        title: `${label.title} on ${label.date}`,
        body: `${label.time} at ${label.location} — are you available?`,
        url: `/sessions/${sessionId}`,
        tag: `session-rsvp-${sessionId}`,
      }, club.timezone)
    )

  // Send to caregivers — batch all athletes per caregiver
  const { data: athletesWithCaregivers } = await adminClient
    .from('athletes')
    .select('id, name, caregiver_user_id')
    .eq('active', true)
    .not('caregiver_user_id', 'is', null)

  // Group athletes by caregiver
  const athletesByCaregiverId: Record<string, string[]> = {}
  for (const a of athletesWithCaregivers ?? []) {
    if (!a.caregiver_user_id) continue
    if (!athletesByCaregiverId[a.caregiver_user_id]) athletesByCaregiverId[a.caregiver_user_id] = []
    athletesByCaregiverId[a.caregiver_user_id].push(a.name)
  }

  const caregiverPromises = Object.entries(athletesByCaregiverId)
    .filter(([cgId]) => notifiable.has(cgId))
    .map(([cgId, names]) =>
      sendPushToUser(cgId, {
        title: `${label.title} on ${label.date}`,
        body: `Will ${names.join(', ')} be attending? ${label.time} at ${label.location}`,
        url: `/sessions/${sessionId}`,
        tag: `session-rsvp-${sessionId}`,
      }, club.timezone)
    )

  await Promise.allSettled([...coachPromises, ...caregiverPromises])
}

// ── notifyPairingsPublished ─────────────────────────────────────────────

export async function notifyPairingsPublished(sessionId: string): Promise<void> {
  const { session, club } = await getSessionWithClub(sessionId)
  if (!session) return

  const label = sessionLabel(session, club.timezone)

  // Get assignments with athlete names and coach names
  const { data: assignments } = await adminClient
    .from('session_assignments')
    .select('coach_id, athlete_id, athletes(name, caregiver_user_id), users!session_assignments_coach_id_fkey(name)')
    .eq('session_id', sessionId)

  if (!assignments || assignments.length === 0) return

  // Group athletes by coach
  const athletesByCoach: Record<string, string[]> = {}
  for (const a of assignments) {
    if (!athletesByCoach[a.coach_id]) athletesByCoach[a.coach_id] = []
    const name = (a as unknown as { athletes?: { name?: string } }).athletes?.name ?? 'an athlete'
    athletesByCoach[a.coach_id].push(name)
  }

  // Collect all user IDs to check notification settings
  const coachIds = [...new Set(assignments.map(a => a.coach_id))]
  const caregiverIds = [...new Set(
    assignments
      .map(a => (a as unknown as { athletes?: { caregiver_user_id?: string } }).athletes?.caregiver_user_id)
      .filter(Boolean) as string[]
  )]
  const notifiable = await filterNotifiable([...coachIds, ...caregiverIds])

  // Notify each coach
  const coachPromises = coachIds
    .filter(id => notifiable.has(id))
    .map(coachId => {
      const names = athletesByCoach[coachId] ?? []
      return sendPushToUser(coachId, {
        title: `Assignments for ${label.date}`,
        body: `You're coaching ${names.join(', ')} at ${label.location}`,
        url: `/sessions/${sessionId}`,
        tag: `session-assignment-${sessionId}`,
      }, club.timezone)
    })

  // Notify each caregiver (batched)
  const athleteDataByCaregiver: Record<string, { athleteName: string; coachName: string }[]> = {}
  for (const a of assignments) {
    const ath = a as unknown as { athletes?: { name?: string; caregiver_user_id?: string }; users?: { name?: string } }
    const cgId = ath.athletes?.caregiver_user_id
    if (!cgId) continue
    if (!athleteDataByCaregiver[cgId]) athleteDataByCaregiver[cgId] = []
    athleteDataByCaregiver[cgId].push({
      athleteName: ath.athletes?.name ?? 'your athlete',
      coachName: ath.users?.name ?? 'their coach',
    })
  }

  const caregiverPromises = Object.entries(athleteDataByCaregiver)
    .filter(([cgId]) => notifiable.has(cgId))
    .map(([cgId, entries]) => {
      const body = entries.map(e => `${e.athleteName} will train with Coach ${e.coachName}`).join('. ')
      return sendPushToUser(cgId, {
        title: `${label.title} on ${label.date}`,
        body: `${body} at ${label.location}`,
        url: `/sessions/${sessionId}`,
        tag: `session-confirmed-${sessionId}`,
      }, club.timezone)
    })

  await Promise.allSettled([...coachPromises, ...caregiverPromises])
}

// ── notifyPairingsRepublished ───────────────────────────────────────────

export interface PairingChange {
  coachId?: string
  athleteId?: string
  type: 'coach_removed' | 'coach_added' | 'athlete_removed' | 'athlete_added' | 'reassigned'
}

export async function notifyPairingsRepublished(
  sessionId: string,
  changes: PairingChange[]
): Promise<void> {
  const { session, club } = await getSessionWithClub(sessionId)
  if (!session) return

  const label = sessionLabel(session, club.timezone)

  // Collect affected user IDs
  const affectedCoachIds = new Set(changes.map(c => c.coachId).filter(Boolean) as string[])
  const affectedAthleteIds = new Set(changes.map(c => c.athleteId).filter(Boolean) as string[])

  // Get caregiver IDs for affected athletes
  let caregiverIds: string[] = []
  if (affectedAthleteIds.size > 0) {
    const { data: athletes } = await adminClient
      .from('athletes')
      .select('id, caregiver_user_id')
      .in('id', [...affectedAthleteIds])
    caregiverIds = (athletes ?? [])
      .map(a => a.caregiver_user_id)
      .filter(Boolean) as string[]
  }

  const allIds = [...affectedCoachIds, ...caregiverIds]
  const notifiable = await filterNotifiable(allIds)

  const promises: Promise<void>[] = []

  // Notify affected coaches
  for (const coachId of affectedCoachIds) {
    if (!notifiable.has(coachId)) continue
    promises.push(
      sendPushToUser(coachId, {
        title: `Updated assignments for ${label.date}`,
        body: `Your assignments for ${label.date} at ${label.location} have changed`,
        url: `/sessions/${sessionId}`,
        tag: `session-assignment-${sessionId}`,
      }, club.timezone)
    )
  }

  // Notify affected caregivers
  for (const cgId of caregiverIds) {
    if (!notifiable.has(cgId)) continue
    promises.push(
      sendPushToUser(cgId, {
        title: `Updated for ${label.date}`,
        body: `Your athlete's coach for ${label.date} has changed`,
        url: `/sessions/${sessionId}`,
        tag: `session-confirmed-${sessionId}`,
      }, club.timezone)
    )
  }

  await Promise.allSettled(promises)
}

// ── notifyPairingsStale ─────────────────────────────────────────────────

export async function notifyPairingsStale(
  sessionId: string,
  details: string
): Promise<void> {
  const { session, club } = await getSessionWithClub(sessionId)
  if (!session) return

  const label = sessionLabel(session, club.timezone)

  // Notify admins
  const { data: admins } = await adminClient
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .eq('active', true)

  const notifiable = await filterNotifiable((admins ?? []).map(a => a.id))

  const promises = (admins ?? [])
    .filter(a => notifiable.has(a.id))
    .map(a =>
      sendPushToUser(a.id, {
        title: `Pairings need review — ${label.date}`,
        body: details,
        url: `/admin/sessions/${sessionId}/pairings`,
        tag: `session-pairings-stale-${sessionId}`,
      }, club.timezone)
    )

  await Promise.allSettled(promises)
}

// ── notifySessionCancelled ──────────────────────────────────────────────

export async function notifySessionCancelled(sessionId: string): Promise<void> {
  const { session, club } = await getSessionWithClub(sessionId)
  if (!session) return

  const label = sessionLabel(session, club.timezone)

  // Get all coaches who RSVP'd available
  const { data: coachRsvps } = await adminClient
    .from('session_coach_rsvps')
    .select('coach_id')
    .eq('session_id', sessionId)
    .eq('status', 'available')

  // Get all athletes who RSVP'd attending and their caregivers
  const { data: athleteRsvps } = await adminClient
    .from('session_athlete_rsvps')
    .select('athlete_id, athletes(caregiver_user_id)')
    .eq('session_id', sessionId)
    .eq('status', 'attending')

  const coachIds = (coachRsvps ?? []).map(r => r.coach_id)
  const caregiverIds = [...new Set(
    (athleteRsvps ?? [])
      .map(r => (r as unknown as { athletes?: { caregiver_user_id?: string } }).athletes?.caregiver_user_id)
      .filter(Boolean) as string[]
  )]

  const notifiable = await filterNotifiable([...coachIds, ...caregiverIds])

  const payload = {
    title: `${label.title} cancelled`,
    body: `${label.date} at ${label.location} has been cancelled`,
    url: '/sessions',
    tag: `session-cancelled-${sessionId}`,
  }

  const promises = [
    ...coachIds.filter(id => notifiable.has(id)).map(id => sendPushToUser(id, payload, club.timezone)),
    ...caregiverIds.filter(id => notifiable.has(id)).map(id => sendPushToUser(id, payload, club.timezone)),
  ]

  await Promise.allSettled(promises)
}
