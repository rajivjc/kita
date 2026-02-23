/**
 * Unit tests for Strava sync pipeline performance optimizations.
 *
 * These tests specifically validate:
 * 1. Delete handler batches feel_prompt notification cleanup (no N+1)
 * 2. Delete handler parallelizes initial operations (soft-delete + resolve + fetch)
 * 3. Multi-session delete only makes one batch update for all feel_prompt notifications
 */

// ── Mocks (must be before imports) ───────────────────────────────────────────

const mockFrom = jest.fn()

jest.mock('@/lib/supabase/admin', () => ({
  adminClient: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

const mockGetValidAccessToken = jest.fn()
jest.mock('@/lib/strava/tokens', () => ({
  getValidAccessToken: (...args: unknown[]) => mockGetValidAccessToken(...args),
}))

const mockGetActivity = jest.fn()
jest.mock('@/lib/strava/client', () => ({
  getActivity: (...args: unknown[]) => mockGetActivity(...args),
}))

const mockMatchActivityToAthlete = jest.fn()
jest.mock('@/lib/strava/matching', () => ({
  matchActivityToAthlete: (...args: unknown[]) =>
    mockMatchActivityToAthlete(...args),
}))

const mockCheckAndAwardMilestones = jest.fn()
jest.mock('@/lib/milestones', () => ({
  checkAndAwardMilestones: (...args: unknown[]) =>
    mockCheckAndAwardMilestones(...args),
}))

import { processStravaActivity } from '@/lib/strava/sync'

// ── Helpers ──────────────────────────────────────────────────────────────────

function createQueueMock() {
  const queues: Record<string, Array<{ data: unknown; error: unknown }>> = {}
  const inserts: Record<string, unknown[]> = {}
  const updates: Record<string, unknown[]> = {}

  function enqueue(
    table: string,
    ...responses: Array<{ data: unknown; error?: unknown }>
  ) {
    if (!queues[table]) queues[table] = []
    for (const r of responses) {
      queues[table].push({ data: r.data, error: r.error ?? null })
    }
  }

  function impl(table: string) {
    const obj: Record<string, unknown> = {}
    const handler: ProxyHandler<Record<string, unknown>> = {
      get(_target, prop: string) {
        if (prop === 'then') {
          const queue = queues[table]
          const response = queue?.shift() ?? { data: null, error: null }
          return (resolve: (v: unknown) => void) => resolve(response)
        }
        if (prop === 'insert') {
          return (data: unknown) => {
            if (!inserts[table]) inserts[table] = []
            inserts[table].push(data)
            return new Proxy(obj, handler)
          }
        }
        if (prop === 'update') {
          return (data: unknown) => {
            if (!updates[table]) updates[table] = []
            updates[table].push(data)
            return new Proxy(obj, handler)
          }
        }
        return (..._args: unknown[]) => new Proxy(obj, handler)
      },
    }
    return new Proxy(obj, handler)
  }

  return { enqueue, impl, inserts, updates }
}

const COACH_ID = 'coach-user-1'
const ACTIVITY_ID = 99999

beforeEach(() => {
  jest.clearAllMocks()
  mockGetValidAccessToken.mockResolvedValue('valid-access-token')
  mockCheckAndAwardMilestones.mockResolvedValue(0)
})

// ── Delete event — batched feel_prompt cleanup ─────────────────────────────

describe('processStravaActivity — delete event with batched notification cleanup', () => {
  it('cleans up feel_prompt notifications for multiple sessions in batch', async () => {
    const mock = createQueueMock()

    // Step 1: sync log insert
    mock.enqueue('strava_sync_log', { data: { id: 'log-1' } })

    // Parallel block: soft-delete sessions, resolve unmatched, fetch notifications, fetch sessions
    mock.enqueue('sessions', { data: null }) // soft-delete
    mock.enqueue('strava_unmatched', { data: null }) // resolve
    mock.enqueue('notifications', { data: [] }) // unmatched_run notifs — none
    // Sessions with this activity — 3 sessions (simulating multi-athlete match)
    mock.enqueue('sessions', { data: [{ id: 'sess-1' }, { id: 'sess-2' }, { id: 'sess-3' }] })

    // Batched feel_prompt lookups — one per session (all parallel)
    mock.enqueue('notifications', { data: [{ id: 'feel-1' }] }) // sess-1 has one
    mock.enqueue('notifications', { data: [] })                  // sess-2 has none
    mock.enqueue('notifications', { data: [{ id: 'feel-3' }] }) // sess-3 has one

    // Batch update of all feel notif IDs in one call
    mock.enqueue('notifications', { data: null })

    // Sync log update
    mock.enqueue('strava_sync_log', { data: null })

    mockFrom.mockImplementation(mock.impl)

    await processStravaActivity(ACTIVITY_ID, COACH_ID, 'delete', {})

    // Verify that feel_prompt notifications were batch-updated
    // Should only have 1 notifications update (batch) not 3 separate ones
    const notifUpdates = mock.updates['notifications'] ?? []
    // One update for the batch of feel_prompt notifications
    expect(notifUpdates).toHaveLength(1)
    expect(notifUpdates[0]).toEqual({ read: true })
  })

  it('skips feel_prompt cleanup when no sessions exist for activity', async () => {
    const mock = createQueueMock()

    // Step 1: sync log insert
    mock.enqueue('strava_sync_log', { data: { id: 'log-1' } })

    // Parallel block
    mock.enqueue('sessions', { data: null }) // soft-delete
    mock.enqueue('strava_unmatched', { data: null }) // resolve
    mock.enqueue('notifications', { data: [] }) // no unmatched_run notifs
    mock.enqueue('sessions', { data: [] }) // no sessions found

    // Sync log update
    mock.enqueue('strava_sync_log', { data: null })

    mockFrom.mockImplementation(mock.impl)

    await processStravaActivity(ACTIVITY_ID, COACH_ID, 'delete', {})

    // No notification updates (no sessions = no feel_prompt to clean up)
    expect(mock.updates['notifications']).toBeUndefined()
  })

  it('handles delete with both unmatched and feel_prompt notifications', async () => {
    const mock = createQueueMock()

    // Step 1: sync log insert
    mock.enqueue('strava_sync_log', { data: { id: 'log-1' } })

    // Parallel block
    mock.enqueue('sessions', { data: null })
    mock.enqueue('strava_unmatched', { data: null })
    mock.enqueue('notifications', { data: [{ id: 'um-notif-1' }] }) // has unmatched_run notif
    mock.enqueue('sessions', { data: [{ id: 'sess-1' }] }) // one session

    // Mark unmatched_run notification as read
    mock.enqueue('notifications', { data: null })

    // Batched feel_prompt lookup
    mock.enqueue('notifications', { data: [{ id: 'feel-1' }] })

    // Batch update of feel_prompt
    mock.enqueue('notifications', { data: null })

    // Sync log update
    mock.enqueue('strava_sync_log', { data: null })

    mockFrom.mockImplementation(mock.impl)

    await processStravaActivity(ACTIVITY_ID, COACH_ID, 'delete', {})

    // Both unmatched_run and feel_prompt notifications should be marked read
    const notifUpdates = mock.updates['notifications'] ?? []
    expect(notifUpdates).toHaveLength(2)
    expect(notifUpdates[0]).toEqual({ read: true })
    expect(notifUpdates[1]).toEqual({ read: true })
  })
})
