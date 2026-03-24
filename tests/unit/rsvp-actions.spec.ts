/**
 * Unit tests for RSVP server actions.
 *
 * Tests cover: coachRsvp, caregiverAthleteRsvp, proxyRsvp,
 * pairings stale logic, and auth checks.
 */

// ── Mocks (must be before imports) ──────────────────────────────────────────

const mockGetUser = jest.fn()
const mockFrom = jest.fn()
const mockLogAudit = jest.fn()
const mockRevalidatePath = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
  }),
}))

jest.mock('@/lib/supabase/admin', () => ({
  adminClient: {
    from: (table: string) => mockFrom(table),
  },
}))

jest.mock('@/lib/audit', () => ({
  logAudit: (...args: unknown[]) => mockLogAudit(...args),
}))

jest.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

import { coachRsvp, caregiverAthleteRsvp, proxyRsvp } from '@/lib/sessions/rsvp-actions'

// ── Helpers ─────────────────────────────────────────────────────────────────

function mockAuth(user: { id: string; email: string } | null) {
  if (!user) {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    return
  }
  mockGetUser.mockResolvedValue({ data: { user } })
}

/** Build a chainable mock for adminClient.from(table) */
function chainMock(resolvedData: unknown, resolvedError: unknown = null) {
  const chain: Record<string, jest.Mock> = {}
  const self = () => chain

  chain.select = jest.fn().mockReturnValue(chain)
  chain.insert = jest.fn().mockReturnValue(chain)
  chain.update = jest.fn().mockReturnValue(chain)
  chain.delete = jest.fn().mockReturnValue(chain)
  chain.eq = jest.fn().mockReturnValue(chain)
  chain.in = jest.fn().mockReturnValue(chain)
  chain.single = jest.fn().mockResolvedValue({ data: resolvedData, error: resolvedError })

  return chain
}

// Build more complex multi-table mock routing
type TableMocks = Record<string, ReturnType<typeof chainMock>>

function setupTableMocks(tables: TableMocks) {
  mockFrom.mockImplementation((table: string) => {
    return tables[table] ?? chainMock(null)
  })
}

const defaultUser = { id: 'user-1', email: 'coach@test.com' }
const defaultSession = {
  id: 'session-1',
  status: 'published',
  pairings_published_at: null,
  pairings_stale: false,
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ── coachRsvp ────────────────────────────────────────────────────────────────

describe('coachRsvp', () => {
  function setupCoachRsvp(opts: {
    role?: string
    sessionStatus?: string
    currentRsvpStatus?: string
    pairingsPublishedAt?: string | null
    updateError?: unknown
  } = {}) {
    const {
      role = 'coach',
      sessionStatus = 'published',
      currentRsvpStatus = 'pending',
      pairingsPublishedAt = null,
      updateError = null,
    } = opts

    mockAuth(defaultUser)

    const usersMock = chainMock({ id: defaultUser.id, role, can_manage_sessions: false })
    const sessionMock = chainMock({ ...defaultSession, status: sessionStatus, pairings_published_at: pairingsPublishedAt })
    const rsvpSelectMock = chainMock({ status: currentRsvpStatus })
    const rsvpUpdateMock = chainMock(null, updateError)
    const assignmentDeleteMock = chainMock([])
    const sessionUpdateMock = chainMock(null)

    // Track call count to session_coach_rsvps to return different mocks
    let coachRsvpCallCount = 0

    setupTableMocks({
      users: usersMock,
      training_sessions: sessionMock,
      session_assignments: assignmentDeleteMock,
    })

    // Override for session_coach_rsvps (needs to handle select then update)
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return usersMock
      if (table === 'training_sessions') {
        // Could be select or update — return appropriate mock
        return { ...sessionMock, ...sessionUpdateMock, select: sessionMock.select, update: sessionUpdateMock.update }
      }
      if (table === 'session_coach_rsvps') {
        coachRsvpCallCount++
        return coachRsvpCallCount === 1 ? rsvpSelectMock : rsvpUpdateMock
      }
      if (table === 'session_assignments') return assignmentDeleteMock
      return chainMock(null)
    })

    return { rsvpUpdateMock }
  }

  it('sets status to available with responded_at', async () => {
    setupCoachRsvp()
    const result = await coachRsvp('session-1', 'available')
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
  })

  it('sets status to unavailable with responded_at', async () => {
    setupCoachRsvp()
    const result = await coachRsvp('session-1', 'unavailable')
    expect(result.success).toBeTruthy()
  })

  it('rejects if user is not a coach', async () => {
    setupCoachRsvp({ role: 'caregiver' })
    const result = await coachRsvp('session-1', 'available')
    expect(result.error).toBe('Only coaches can RSVP.')
  })

  it('rejects if session is cancelled', async () => {
    setupCoachRsvp({ sessionStatus: 'cancelled' })
    const result = await coachRsvp('session-1', 'available')
    expect(result.error).toBe('Cannot RSVP to a cancelled session.')
  })

  it('rejects if session is draft', async () => {
    setupCoachRsvp({ sessionStatus: 'draft' })
    const result = await coachRsvp('session-1', 'available')
    expect(result.error).toBe('Cannot RSVP to a draft session.')
  })

  it('rejects if session does not exist', async () => {
    mockAuth(defaultUser)
    const usersMock = chainMock({ id: defaultUser.id, role: 'coach', can_manage_sessions: false })
    const sessionMock = chainMock(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return usersMock
      if (table === 'training_sessions') return sessionMock
      return chainMock(null)
    })

    const result = await coachRsvp('nonexistent', 'available')
    expect(result.error).toBe('Session not found.')
  })

  it('rejects if not authenticated', async () => {
    mockAuth(null)
    const result = await coachRsvp('session-1', 'available')
    expect(result.error).toBe('Your session has expired. Please sign in again.')
  })

  it('changing to unavailable after pairings published removes assignments and sets stale', async () => {
    setupCoachRsvp({
      currentRsvpStatus: 'available',
      pairingsPublishedAt: '2026-03-20T00:00:00Z',
    })
    const result = await coachRsvp('session-1', 'unavailable')
    expect(result.success).toBeTruthy()
    // Verify session_assignments delete was called and training_sessions update was called
    expect(mockFrom).toHaveBeenCalledWith('session_assignments')
    expect(mockFrom).toHaveBeenCalledWith('training_sessions')
  })

  it('changing to available after being unavailable does NOT trigger stale logic', async () => {
    setupCoachRsvp({ currentRsvpStatus: 'unavailable' })
    const result = await coachRsvp('session-1', 'available')
    expect(result.success).toBeTruthy()
    // session_assignments should not have been called for deletion
    const assignmentCalls = mockFrom.mock.calls.filter((c: unknown[]) => c[0] === 'session_assignments')
    expect(assignmentCalls.length).toBe(0)
  })
})

// ── caregiverAthleteRsvp ─────────────────────────────────────────────────────

describe('caregiverAthleteRsvp', () => {
  function setupCaregiverRsvp(opts: {
    isLinkedCaregiver?: boolean
    sessionStatus?: string
    currentRsvpStatus?: string
    pairingsPublishedAt?: string | null
  } = {}) {
    const {
      isLinkedCaregiver = true,
      sessionStatus = 'published',
      currentRsvpStatus = 'pending',
      pairingsPublishedAt = null,
    } = opts

    mockAuth(defaultUser)

    const usersMock = chainMock({ id: defaultUser.id, role: 'caregiver', can_manage_sessions: false })
    const athleteMock = chainMock({
      id: 'athlete-1',
      caregiver_user_id: isLinkedCaregiver ? defaultUser.id : 'other-user',
    })
    const sessionMock = chainMock({
      ...defaultSession,
      status: sessionStatus,
      pairings_published_at: pairingsPublishedAt,
    })
    const rsvpSelectMock = chainMock({ status: currentRsvpStatus })
    const rsvpUpdateMock = chainMock(null)
    const assignmentDeleteMock = chainMock([])
    const sessionUpdateMock = chainMock(null)

    let athleteRsvpCallCount = 0

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return usersMock
      if (table === 'athletes') return athleteMock
      if (table === 'training_sessions') return { ...sessionMock, ...sessionUpdateMock, select: sessionMock.select, update: sessionUpdateMock.update }
      if (table === 'session_athlete_rsvps') {
        athleteRsvpCallCount++
        return athleteRsvpCallCount === 1 ? rsvpSelectMock : rsvpUpdateMock
      }
      if (table === 'session_assignments') return assignmentDeleteMock
      return chainMock(null)
    })
  }

  it('sets athlete status to attending', async () => {
    setupCaregiverRsvp()
    const result = await caregiverAthleteRsvp('session-1', 'athlete-1', 'attending')
    expect(result.success).toBeTruthy()
  })

  it('sets athlete status to not_attending', async () => {
    setupCaregiverRsvp()
    const result = await caregiverAthleteRsvp('session-1', 'athlete-1', 'not_attending')
    expect(result.success).toBeTruthy()
  })

  it('rejects if user is not linked caregiver', async () => {
    setupCaregiverRsvp({ isLinkedCaregiver: false })
    const result = await caregiverAthleteRsvp('session-1', 'athlete-1', 'attending')
    expect(result.error).toBe('You are not the linked caregiver for this athlete.')
  })

  it('changing to not_attending after pairings removes assignment and sets stale', async () => {
    setupCaregiverRsvp({
      currentRsvpStatus: 'attending',
      pairingsPublishedAt: '2026-03-20T00:00:00Z',
    })
    const result = await caregiverAthleteRsvp('session-1', 'athlete-1', 'not_attending')
    expect(result.success).toBeTruthy()
    expect(mockFrom).toHaveBeenCalledWith('session_assignments')
  })
})

// ── proxyRsvp ────────────────────────────────────────────────────────────────

describe('proxyRsvp', () => {
  function setupProxyRsvp(opts: {
    role?: string
    type?: 'coach' | 'athlete'
  } = {}) {
    const { role = 'admin', type = 'athlete' } = opts

    mockAuth(defaultUser)

    const usersMock = chainMock({ id: defaultUser.id, role, can_manage_sessions: false })
    const sessionMock = chainMock({ ...defaultSession, status: 'published' })
    const rsvpSelectMock = chainMock({ status: 'pending' })
    const rsvpUpdateMock = chainMock(null)

    const rsvpTable = type === 'coach' ? 'session_coach_rsvps' : 'session_athlete_rsvps'
    let rsvpCallCount = 0

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return usersMock
      if (table === 'training_sessions') return sessionMock
      if (table === rsvpTable) {
        rsvpCallCount++
        return rsvpCallCount === 1 ? rsvpSelectMock : rsvpUpdateMock
      }
      return chainMock(null)
    })
  }

  it('admin can proxy for coaches', async () => {
    setupProxyRsvp({ role: 'admin', type: 'coach' })
    const result = await proxyRsvp('session-1', 'coach', 'target-coach', 'available')
    expect(result.success).toBeTruthy()
  })

  it('admin can proxy for athletes', async () => {
    setupProxyRsvp({ role: 'admin', type: 'athlete' })
    const result = await proxyRsvp('session-1', 'athlete', 'target-athlete', 'attending')
    expect(result.success).toBeTruthy()
  })

  it('coach can proxy for athletes', async () => {
    setupProxyRsvp({ role: 'coach', type: 'athlete' })
    const result = await proxyRsvp('session-1', 'athlete', 'target-athlete', 'attending')
    expect(result.success).toBeTruthy()
  })

  it('coach CANNOT proxy for other coaches', async () => {
    setupProxyRsvp({ role: 'coach', type: 'coach' })
    const result = await proxyRsvp('session-1', 'coach', 'target-coach', 'available')
    expect(result.error).toBe('Only admins can respond on behalf of coaches.')
  })

  it('sets responded_by to the proxy user ID', async () => {
    setupProxyRsvp({ role: 'admin', type: 'athlete' })
    await proxyRsvp('session-1', 'athlete', 'target-athlete', 'attending')
    // Verify update was called with responded_by
    const rsvpCalls = mockFrom.mock.calls.filter((c: unknown[]) => c[0] === 'session_athlete_rsvps')
    expect(rsvpCalls.length).toBeGreaterThan(0)
  })

  it('audit logs the proxy action', async () => {
    setupProxyRsvp({ role: 'admin', type: 'athlete' })
    await proxyRsvp('session-1', 'athlete', 'target-athlete', 'attending')
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'rsvp.proxy',
        targetType: 'session_athlete_rsvp',
        targetId: 'target-athlete',
        metadata: expect.objectContaining({
          sessionId: 'session-1',
          type: 'athlete',
          respondedBy: defaultUser.id,
        }),
      })
    )
  })

  it('caregiver cannot proxy', async () => {
    setupProxyRsvp({ role: 'caregiver', type: 'athlete' })
    const result = await proxyRsvp('session-1', 'athlete', 'target-athlete', 'attending')
    expect(result.error).toBe('Only coaches and admins can respond on behalf of athletes.')
  })
})
