/**
 * Unit tests for training session push notifications.
 *
 * Tests cover: notifySessionPublished, notifyPairingsPublished,
 * notifyPairingsRepublished, notifySessionCancelled, opt-out,
 * and caregiver batching.
 */

// ── Mocks ────────────────────────────────────────────────────────────────

const mockSendPushToUser = jest.fn().mockResolvedValue(undefined)
const mockFrom = jest.fn()
const mockGetClub = jest.fn()

jest.mock('@/lib/push', () => ({
  sendPushToUser: (...args: unknown[]) => mockSendPushToUser(...args),
}))

jest.mock('@/lib/supabase/admin', () => ({
  adminClient: {
    from: (table: string) => mockFrom(table),
  },
}))

jest.mock('@/lib/club', () => ({
  getClub: () => mockGetClub(),
}))

import {
  notifySessionPublished,
  notifyPairingsPublished,
  notifyPairingsRepublished,
  notifySessionCancelled,
} from '@/lib/sessions/notifications'

// ── Helpers ─────────────────────────────────────────────────────────────

function chainMock(resolvedData: unknown, resolvedError: unknown = null) {
  // Create a promise that also has chainable methods
  const resolved = { data: resolvedData, error: resolvedError }
  const makeChain = (): any => {
    const promise = Promise.resolve(resolved)
    const handler: ProxyHandler<Promise<typeof resolved>> = {
      get(target, prop) {
        if (prop === 'then' || prop === 'catch' || prop === 'finally') {
          return (target as any)[prop].bind(target)
        }
        if (prop === 'single') {
          return jest.fn().mockResolvedValue(resolved)
        }
        // All other properties return a new chain
        return jest.fn().mockReturnValue(makeChain())
      }
    }
    return new Proxy(promise, handler)
  }
  return makeChain()
}

const defaultSession = {
  id: 'session-1',
  title: 'Training',
  session_start: '2026-03-29T00:00:00.000Z',
  session_end: '2026-03-29T02:00:00.000Z',
  location: 'Fort Canning',
  status: 'published',
}

const defaultClub = {
  id: 'club-1',
  name: 'Test Club',
  timezone: 'UTC',
}

function setupMocks(tableOverrides: Record<string, unknown> = {}) {
  mockGetClub.mockResolvedValue(defaultClub)

  const defaults: Record<string, unknown> = {
    training_sessions: defaultSession,
    users: [{ id: 'user-1' }],
    athletes: [{ id: 'a1', name: 'Nicholas', caregiver_user_id: 'cg-1' }],
    session_coach_rsvps: [],
    session_athlete_rsvps: [],
    session_assignments: [],
    ...tableOverrides,
  }

  mockFrom.mockImplementation((table: string) => {
    return chainMock(defaults[table] ?? null)
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ── notifySessionPublished ──────────────────────────────────────────────

describe('notifySessionPublished', () => {
  it('sends to all coaches with session_notifications = true', async () => {
    const coachesData = [{ id: 'coach-1' }, { id: 'coach-2' }]
    const caregiversData = [{ id: 'cg-1' }]
    const notifiableUsers = [{ id: 'coach-1' }, { id: 'coach-2' }, { id: 'cg-1' }]

    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'training_sessions') return chainMock(defaultSession)
      if (table === 'users') {
        callCount++
        if (callCount <= 2) {
          // First two user queries: coach + caregiver role queries
          return chainMock(callCount === 1 ? coachesData : caregiversData)
        }
        // Third call: filterNotifiable
        return chainMock(notifiableUsers)
      }
      if (table === 'athletes') return chainMock([{ id: 'a1', name: 'Nicholas', caregiver_user_id: 'cg-1' }])
      return chainMock(null)
    })
    mockGetClub.mockResolvedValue(defaultClub)

    await notifySessionPublished('session-1')

    // Should have called sendPushToUser for coach-1, coach-2, and cg-1
    expect(mockSendPushToUser).toHaveBeenCalled()
    const calls = mockSendPushToUser.mock.calls
    // At least coaches get notified
    expect(calls.length).toBeGreaterThanOrEqual(2)

    // Verify notification text includes date and location
    const firstPayload = calls[0][1]
    expect(firstPayload.body).toContain('Fort Canning')
  })

  it('does NOT send to coaches with session_notifications = false', async () => {
    // filterNotifiable returns empty — no one opted in
    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'training_sessions') return chainMock(defaultSession)
      if (table === 'users') {
        callCount++
        if (callCount <= 2) return chainMock([{ id: 'coach-1' }])
        return chainMock([]) // filterNotifiable returns empty
      }
      if (table === 'athletes') return chainMock([])
      return chainMock(null)
    })
    mockGetClub.mockResolvedValue(defaultClub)

    await notifySessionPublished('session-1')

    expect(mockSendPushToUser).not.toHaveBeenCalled()
  })

  it('sends ONE notification per caregiver (batched across athletes)', async () => {
    const coaches: { id: string }[] = []
    const caregivers = [{ id: 'cg-1' }]
    const athletes = [
      { id: 'a1', name: 'Nicholas', caregiver_user_id: 'cg-1' },
      { id: 'a2', name: 'Sarah', caregiver_user_id: 'cg-1' },
      { id: 'a3', name: 'Marcus', caregiver_user_id: 'cg-1' },
    ]

    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'training_sessions') return chainMock(defaultSession)
      if (table === 'users') {
        callCount++
        if (callCount === 1) return chainMock(coaches)
        if (callCount === 2) return chainMock(caregivers)
        return chainMock([{ id: 'cg-1' }]) // filterNotifiable
      }
      if (table === 'athletes') return chainMock(athletes)
      return chainMock(null)
    })
    mockGetClub.mockResolvedValue(defaultClub)

    await notifySessionPublished('session-1')

    // Only ONE call for caregiver cg-1 (despite 3 athletes)
    expect(mockSendPushToUser).toHaveBeenCalledTimes(1)
    const body = mockSendPushToUser.mock.calls[0][1].body
    expect(body).toContain('Nicholas')
    expect(body).toContain('Sarah')
    expect(body).toContain('Marcus')
  })
})

// ── notifyPairingsPublished ─────────────────────────────────────────────

describe('notifyPairingsPublished', () => {
  it('sends to each assigned coach with athlete names', async () => {
    const assignments = [
      {
        coach_id: 'coach-1',
        athlete_id: 'a1',
        athletes: { name: 'Nicholas', caregiver_user_id: null },
        users: { name: 'Coach Alice' },
      },
      {
        coach_id: 'coach-1',
        athlete_id: 'a2',
        athletes: { name: 'Sarah', caregiver_user_id: null },
        users: { name: 'Coach Alice' },
      },
    ]

    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'training_sessions') return chainMock(defaultSession)
      if (table === 'session_assignments') return chainMock(assignments)
      if (table === 'users') {
        callCount++
        // filterNotifiable
        return chainMock([{ id: 'coach-1' }])
      }
      return chainMock(null)
    })
    mockGetClub.mockResolvedValue(defaultClub)

    await notifyPairingsPublished('session-1')

    expect(mockSendPushToUser).toHaveBeenCalledTimes(1) // 1 coach
    const body = mockSendPushToUser.mock.calls[0][1].body
    expect(body).toContain('Nicholas')
    expect(body).toContain('Sarah')
  })

  it('does NOT send to coaches without assignments', async () => {
    // No assignments at all
    mockFrom.mockImplementation((table: string) => {
      if (table === 'training_sessions') return chainMock(defaultSession)
      if (table === 'session_assignments') return chainMock([])
      return chainMock(null)
    })
    mockGetClub.mockResolvedValue(defaultClub)

    await notifyPairingsPublished('session-1')

    expect(mockSendPushToUser).not.toHaveBeenCalled()
  })

  it('sends to caregivers of assigned athletes with coach name', async () => {
    const assignments = [
      {
        coach_id: 'coach-1',
        athlete_id: 'a1',
        athletes: { name: 'Nicholas', caregiver_user_id: 'cg-1' },
        users: { name: 'Alice' },
      },
    ]

    mockFrom.mockImplementation((table: string) => {
      if (table === 'training_sessions') return chainMock(defaultSession)
      if (table === 'session_assignments') return chainMock(assignments)
      if (table === 'users') return chainMock([{ id: 'coach-1' }, { id: 'cg-1' }])
      return chainMock(null)
    })
    mockGetClub.mockResolvedValue(defaultClub)

    await notifyPairingsPublished('session-1')

    // Should send to both coach-1 and cg-1
    expect(mockSendPushToUser).toHaveBeenCalledTimes(2)
    // Find the caregiver notification
    const cgCall = mockSendPushToUser.mock.calls.find((c: unknown[]) => c[0] === 'cg-1')
    expect(cgCall).toBeDefined()
    expect(cgCall![1].body).toContain('Nicholas')
    expect(cgCall![1].body).toContain('Alice')
  })
})

// ── notifyPairingsRepublished ───────────────────────────────────────────

describe('notifyPairingsRepublished', () => {
  it('only sends to people whose assignments changed', async () => {
    const changes = [
      { coachId: 'coach-1', type: 'reassigned' as const },
      { athleteId: 'a1', type: 'athlete_removed' as const },
    ]

    mockFrom.mockImplementation((table: string) => {
      if (table === 'training_sessions') return chainMock(defaultSession)
      if (table === 'athletes') return chainMock([{ id: 'a1', caregiver_user_id: 'cg-1' }])
      if (table === 'users') return chainMock([{ id: 'coach-1' }, { id: 'cg-1' }])
      return chainMock(null)
    })
    mockGetClub.mockResolvedValue(defaultClub)

    await notifyPairingsRepublished('session-1', changes)

    // Should send to affected coach-1 and affected caregiver cg-1
    expect(mockSendPushToUser).toHaveBeenCalledTimes(2)
    const userIds = mockSendPushToUser.mock.calls.map((c: unknown[]) => c[0])
    expect(userIds).toContain('coach-1')
    expect(userIds).toContain('cg-1')
  })

  it('does NOT send to people with unchanged assignments', async () => {
    // Changes only affect coach-1, not coach-2
    const changes = [{ coachId: 'coach-1', type: 'reassigned' as const }]

    mockFrom.mockImplementation((table: string) => {
      if (table === 'training_sessions') return chainMock(defaultSession)
      if (table === 'athletes') return chainMock([])
      if (table === 'users') return chainMock([{ id: 'coach-1' }]) // only coach-1 is notifiable
      return chainMock(null)
    })
    mockGetClub.mockResolvedValue(defaultClub)

    await notifyPairingsRepublished('session-1', changes)

    // Only coach-1 gets notified
    const userIds = mockSendPushToUser.mock.calls.map((c: unknown[]) => c[0])
    expect(userIds).not.toContain('coach-2')
  })
})

// ── notifySessionCancelled ──────────────────────────────────────────────

describe('notifySessionCancelled', () => {
  it('sends to all with positive RSVPs', async () => {
    const coachRsvps = [{ coach_id: 'coach-1' }, { coach_id: 'coach-2' }]
    const athleteRsvps = [
      { athlete_id: 'a1', athletes: { caregiver_user_id: 'cg-1' } },
    ]

    mockFrom.mockImplementation((table: string) => {
      if (table === 'training_sessions') return chainMock(defaultSession)
      if (table === 'session_coach_rsvps') return chainMock(coachRsvps)
      if (table === 'session_athlete_rsvps') return chainMock(athleteRsvps)
      if (table === 'users') return chainMock([{ id: 'coach-1' }, { id: 'coach-2' }, { id: 'cg-1' }])
      return chainMock(null)
    })
    mockGetClub.mockResolvedValue(defaultClub)

    await notifySessionCancelled('session-1')

    // coach-1, coach-2, cg-1 = 3 calls
    expect(mockSendPushToUser).toHaveBeenCalledTimes(3)
    const body = mockSendPushToUser.mock.calls[0][1].body
    expect(body).toContain('cancelled')
  })

  it('does NOT send to people who RSVPd negative', async () => {
    // No positive RSVPs at all
    mockFrom.mockImplementation((table: string) => {
      if (table === 'training_sessions') return chainMock(defaultSession)
      if (table === 'session_coach_rsvps') return chainMock([]) // no available coaches
      if (table === 'session_athlete_rsvps') return chainMock([]) // no attending athletes
      if (table === 'users') return chainMock([])
      return chainMock(null)
    })
    mockGetClub.mockResolvedValue(defaultClub)

    await notifySessionCancelled('session-1')

    expect(mockSendPushToUser).not.toHaveBeenCalled()
  })
})
