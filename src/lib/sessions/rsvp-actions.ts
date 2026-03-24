'use server'

import { adminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/audit'

export type RsvpActionState = {
  error?: string
  success?: string
}

// ── Auth helpers ─────────────────────────────────────────────────────────────

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Your session has expired. Please sign in again.' } as const
  const { data: dbUser } = await adminClient
    .from('users')
    .select('id, role, can_manage_sessions')
    .eq('id', user.id)
    .single()
  if (!dbUser) return { error: 'User not found.' } as const
  return { user: { ...dbUser, id: user.id, email: user.email } }
}

async function getSession(sessionId: string) {
  const { data } = await adminClient
    .from('training_sessions')
    .select('id, status, pairings_published_at, pairings_stale')
    .eq('id', sessionId)
    .single()
  return data
}

/**
 * When a positive RSVP is revoked after pairings have been published,
 * remove the affected assignments and mark pairings as stale.
 */
async function handlePairingsStale(
  sessionId: string,
  pairingsPublishedAt: string | null,
  deleteFilter: { column: 'coach_id' | 'athlete_id'; value: string }
): Promise<boolean> {
  if (!pairingsPublishedAt) return false

  // Delete assignments for this coach/athlete
  const { data: deleted } = await adminClient
    .from('session_assignments')
    .delete()
    .eq('session_id', sessionId)
    .eq(deleteFilter.column, deleteFilter.value)
    .select('id')

  // Always set stale flag — even if deletion returned nothing
  await adminClient
    .from('training_sessions')
    .update({ pairings_stale: true })
    .eq('id', sessionId)

  return (deleted?.length ?? 0) > 0
}

// ── coachRsvp ────────────────────────────────────────────────────────────────

export async function coachRsvp(
  sessionId: string,
  status: 'available' | 'unavailable'
): Promise<RsvpActionState> {
  const auth = await getAuthUser()
  if ('error' in auth) return { error: auth.error }
  const { user } = auth

  if (user.role !== 'coach' && user.role !== 'admin') {
    return { error: 'Only coaches can RSVP.' }
  }

  const session = await getSession(sessionId)
  if (!session) return { error: 'Session not found.' }
  if (session.status === 'cancelled') return { error: 'Cannot RSVP to a cancelled session.' }
  if (session.status === 'completed') return { error: 'Cannot RSVP to a completed session.' }
  if (session.status === 'draft') return { error: 'Cannot RSVP to a draft session.' }

  // Get current RSVP to check if changing from positive
  const { data: currentRsvp } = await adminClient
    .from('session_coach_rsvps')
    .select('status')
    .eq('session_id', sessionId)
    .eq('coach_id', user.id)
    .single()

  const wasAvailable = currentRsvp?.status === 'available'

  const { error } = await adminClient
    .from('session_coach_rsvps')
    .update({
      status,
      responded_at: new Date().toISOString(),
      responded_by: null, // self-response
    })
    .eq('session_id', sessionId)
    .eq('coach_id', user.id)

  if (error) return { error: 'Could not update your RSVP. Please try again.' }

  // If changing from available to unavailable after pairings published
  if (wasAvailable && status === 'unavailable') {
    await handlePairingsStale(sessionId, session.pairings_published_at, {
      column: 'coach_id',
      value: user.id,
    })
    // TODO: Phase 5 — notify admin
  }

  revalidatePath(`/sessions/${sessionId}`)
  revalidatePath('/sessions')
  return { success: `RSVP updated to ${status}` }
}

// ── caregiverAthleteRsvp ─────────────────────────────────────────────────────

export async function caregiverAthleteRsvp(
  sessionId: string,
  athleteId: string,
  status: 'attending' | 'not_attending'
): Promise<RsvpActionState> {
  const auth = await getAuthUser()
  if ('error' in auth) return { error: auth.error }
  const { user } = auth

  // Verify current user is linked caregiver for this athlete
  const { data: athlete } = await adminClient
    .from('athletes')
    .select('id, caregiver_user_id')
    .eq('id', athleteId)
    .single()

  if (!athlete) return { error: 'Athlete not found.' }
  if (athlete.caregiver_user_id !== user.id) {
    return { error: 'You are not the linked caregiver for this athlete.' }
  }

  const session = await getSession(sessionId)
  if (!session) return { error: 'Session not found.' }
  if (session.status === 'cancelled') return { error: 'Cannot RSVP to a cancelled session.' }
  if (session.status === 'completed') return { error: 'Cannot RSVP to a completed session.' }
  if (session.status === 'draft') return { error: 'Cannot RSVP to a draft session.' }

  // Get current RSVP to check if changing from positive
  const { data: currentRsvp } = await adminClient
    .from('session_athlete_rsvps')
    .select('status')
    .eq('session_id', sessionId)
    .eq('athlete_id', athleteId)
    .single()

  const wasAttending = currentRsvp?.status === 'attending'

  const { error } = await adminClient
    .from('session_athlete_rsvps')
    .update({
      status,
      responded_at: new Date().toISOString(),
      responded_by: user.id,
    })
    .eq('session_id', sessionId)
    .eq('athlete_id', athleteId)

  if (error) return { error: 'Could not update the RSVP. Please try again.' }

  // If changing from attending to not_attending after pairings published
  if (wasAttending && status === 'not_attending') {
    await handlePairingsStale(sessionId, session.pairings_published_at, {
      column: 'athlete_id',
      value: athleteId,
    })
    // TODO: Phase 5 — notify admin and affected coach
  }

  revalidatePath(`/sessions/${sessionId}`)
  revalidatePath('/sessions')
  return { success: `RSVP updated to ${status === 'attending' ? 'attending' : 'not attending'}` }
}

// ── proxyRsvp ────────────────────────────────────────────────────────────────

export async function proxyRsvp(
  sessionId: string,
  type: 'coach' | 'athlete',
  targetId: string,
  status: string
): Promise<RsvpActionState> {
  const auth = await getAuthUser()
  if ('error' in auth) return { error: auth.error }
  const { user } = auth

  const isAdmin = user.role === 'admin'
  const isCoach = user.role === 'coach'

  // Permission check
  if (type === 'coach' && !isAdmin) {
    return { error: 'Only admins can respond on behalf of coaches.' }
  }
  if (type === 'athlete' && !isAdmin && !isCoach) {
    return { error: 'Only coaches and admins can respond on behalf of athletes.' }
  }

  const session = await getSession(sessionId)
  if (!session) return { error: 'Session not found.' }
  if (session.status !== 'published') return { error: 'Can only proxy RSVP for published sessions.' }

  if (type === 'coach') {
    const coachStatus = status as 'available' | 'unavailable'

    // Get current RSVP
    const { data: currentRsvp } = await adminClient
      .from('session_coach_rsvps')
      .select('status')
      .eq('session_id', sessionId)
      .eq('coach_id', targetId)
      .single()

    const wasAvailable = currentRsvp?.status === 'available'

    const { error } = await adminClient
      .from('session_coach_rsvps')
      .update({
        status: coachStatus,
        responded_at: new Date().toISOString(),
        responded_by: user.id,
      })
      .eq('session_id', sessionId)
      .eq('coach_id', targetId)

    if (error) return { error: 'Could not update the RSVP. Please try again.' }

    if (wasAvailable && coachStatus === 'unavailable') {
      await handlePairingsStale(sessionId, session.pairings_published_at, {
        column: 'coach_id',
        value: targetId,
      })
    }
  } else {
    const athleteStatus = status as 'attending' | 'not_attending'

    // Get current RSVP
    const { data: currentRsvp } = await adminClient
      .from('session_athlete_rsvps')
      .select('status')
      .eq('session_id', sessionId)
      .eq('athlete_id', targetId)
      .single()

    const wasAttending = currentRsvp?.status === 'attending'

    const { error } = await adminClient
      .from('session_athlete_rsvps')
      .update({
        status: athleteStatus,
        responded_at: new Date().toISOString(),
        responded_by: user.id,
      })
      .eq('session_id', sessionId)
      .eq('athlete_id', targetId)

    if (error) return { error: 'Could not update the RSVP. Please try again.' }

    if (wasAttending && athleteStatus === 'not_attending') {
      await handlePairingsStale(sessionId, session.pairings_published_at, {
        column: 'athlete_id',
        value: targetId,
      })
    }
  }

  logAudit({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'rsvp.proxy',
    targetType: type === 'coach' ? 'session_coach_rsvp' : 'session_athlete_rsvp',
    targetId,
    metadata: { sessionId, type, status, respondedBy: user.id },
  })

  revalidatePath(`/sessions/${sessionId}`)
  revalidatePath('/sessions')
  return { success: 'RSVP updated' }
}
