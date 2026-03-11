/**
 * Unit tests for the athlete PIN verification and message server actions.
 *
 * Tests that:
 * 1. PIN verification checks against bcrypt hash
 * 2. Rate limiting locks after 5 failed attempts
 * 3. Lockout expires after 15 minutes
 * 4. Successful PIN sets an HttpOnly cookie
 * 5. setAthletePin validates 4-digit format and hashes
 * 6. sendAthleteMessage validates preset messages and rate limits
 * 7. verifyAthleteCookie checks the cookie value
 */

// ── Mocks (must be before imports) ───────────────────────────────────────────

const mockFrom = jest.fn()

jest.mock('@/lib/supabase/admin', () => ({
  adminClient: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

const mockCookieGet = jest.fn()
const mockCookieSet = jest.fn()

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: (...args: unknown[]) => mockCookieGet(...args),
    set: (...args: unknown[]) => mockCookieSet(...args),
  }),
}))

// Mock bcryptjs
const mockBcryptCompare = jest.fn()
const mockBcryptHash = jest.fn()

jest.mock('bcryptjs', () => ({
  compare: (...args: unknown[]) => mockBcryptCompare(...args),
  hash: (...args: unknown[]) => mockBcryptHash(...args),
}))

import {
  verifyAthletePin,
  setAthletePin,
  sendAthleteMessage,
  verifyAthleteCookie,
} from '@/app/my/[athleteId]/actions'

// ── Helpers ───────────────────────────────────────────────────────────────────

function createQueueMock() {
  const queues: Record<string, Array<{ data: unknown; error: unknown; count?: number | null }>> = {}
  const updates: Record<string, number> = {}
  const inserts: Record<string, number> = {}

  function enqueue(
    table: string,
    ...responses: Array<{ data: unknown; error?: unknown; count?: number | null }>
  ) {
    if (!queues[table]) queues[table] = []
    for (const r of responses) {
      queues[table].push({ data: r.data, error: r.error ?? null, count: r.count ?? null })
    }
  }

  function impl(table: string) {
    const obj: Record<string, unknown> = {}
    const handler: ProxyHandler<Record<string, unknown>> = {
      get(_target, prop: string) {
        if (prop === 'then') {
          const queue = queues[table]
          const response = queue?.shift() ?? { data: null, error: null, count: null }
          return (resolve: (v: unknown) => void) => resolve(response)
        }
        if (prop === 'update') {
          return (..._args: unknown[]) => {
            updates[table] = (updates[table] ?? 0) + 1
            return new Proxy(obj, handler)
          }
        }
        if (prop === 'insert') {
          return (..._args: unknown[]) => {
            inserts[table] = (inserts[table] ?? 0) + 1
            return new Proxy(obj, handler)
          }
        }
        return (..._args: unknown[]) => new Proxy(obj, handler)
      },
    }
    return new Proxy(obj, handler)
  }

  return { enqueue, impl, updates, inserts }
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ── verifyAthletePin ─────────────────────────────────────────────────────────

describe('verifyAthletePin', () => {
  const athleteId = 'athlete-1'

  it('returns error when athlete is not found', async () => {
    const mock = createQueueMock()
    mock.enqueue('athletes', { data: null, error: { code: 'PGRST116' } })
    mockFrom.mockImplementation(mock.impl)

    const result = await verifyAthletePin(athleteId, '1234')
    expect(result.error).toMatch(/could not find/i)
  })

  it('returns error when no PIN is set', async () => {
    const mock = createQueueMock()
    mock.enqueue('athletes', {
      data: { athlete_pin: null, pin_attempts: 0, pin_locked_until: null },
    })
    mockFrom.mockImplementation(mock.impl)

    const result = await verifyAthletePin(athleteId, '1234')
    expect(result.error).toMatch(/not been set up/i)
  })

  it('returns error when account is locked', async () => {
    const future = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const mock = createQueueMock()
    mock.enqueue('athletes', {
      data: { athlete_pin: 'hashed', pin_attempts: 5, pin_locked_until: future },
    })
    mockFrom.mockImplementation(mock.impl)

    const result = await verifyAthletePin(athleteId, '1234')
    expect(result.error).toMatch(/too many tries/i)
  })

  it('resets attempts when lockout has expired', async () => {
    const past = new Date(Date.now() - 60 * 1000).toISOString()
    const mock = createQueueMock()
    // First query: fetch athlete (lockout expired)
    mock.enqueue('athletes', {
      data: { athlete_pin: 'hashed', pin_attempts: 5, pin_locked_until: past },
    })
    // Second query: update to reset attempts
    mock.enqueue('athletes', { data: null })
    // Third: the bcrypt compare will determine next behavior
    mockBcryptCompare.mockResolvedValue(false)
    // Fourth query: update to increment attempts
    mock.enqueue('athletes', { data: null })
    mockFrom.mockImplementation(mock.impl)

    const result = await verifyAthletePin(athleteId, '9999')
    // Should have reset attempts (to 0), then failed with 1 attempt used
    expect(result.error).toMatch(/didn't match/i)
    expect(result.attemptsRemaining).toBe(4) // 5 max - 1 new attempt
    expect(mock.updates['athletes']).toBeGreaterThanOrEqual(2) // reset + increment
  })

  it('returns error with attempts remaining on wrong PIN', async () => {
    const mock = createQueueMock()
    mock.enqueue('athletes', {
      data: { athlete_pin: 'hashed', pin_attempts: 2, pin_locked_until: null },
    })
    // Update for incrementing attempts
    mock.enqueue('athletes', { data: null })
    mockBcryptCompare.mockResolvedValue(false)
    mockFrom.mockImplementation(mock.impl)

    const result = await verifyAthletePin(athleteId, '0000')
    expect(result.error).toMatch(/didn't match/i)
    expect(result.attemptsRemaining).toBe(2)
  })

  it('locks account after 5th failed attempt', async () => {
    const mock = createQueueMock()
    mock.enqueue('athletes', {
      data: { athlete_pin: 'hashed', pin_attempts: 4, pin_locked_until: null },
    })
    // Update for lockout
    mock.enqueue('athletes', { data: null })
    mockBcryptCompare.mockResolvedValue(false)
    mockFrom.mockImplementation(mock.impl)

    const result = await verifyAthletePin(athleteId, '0000')
    expect(result.error).toMatch(/too many tries/i)
  })

  it('succeeds with correct PIN and sets cookie', async () => {
    const mock = createQueueMock()
    mock.enqueue('athletes', {
      data: { athlete_pin: 'hashed', pin_attempts: 0, pin_locked_until: null },
    })
    // Update for resetting attempts
    mock.enqueue('athletes', { data: null })
    mockBcryptCompare.mockResolvedValue(true)
    mockFrom.mockImplementation(mock.impl)

    const result = await verifyAthletePin(athleteId, '1234')
    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    expect(mockCookieSet).toHaveBeenCalledWith(
      `athlete_session_${athleteId}`,
      'verified',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        path: `/my/${athleteId}`,
      })
    )
  })
})

// ── setAthletePin ────────────────────────────────────────────────────────────

describe('setAthletePin', () => {
  const athleteId = 'athlete-1'

  it('rejects non-4-digit PINs', async () => {
    expect((await setAthletePin(athleteId, '12')).error).toMatch(/4 digits/)
    expect((await setAthletePin(athleteId, '12345')).error).toMatch(/4 digits/)
    expect((await setAthletePin(athleteId, 'abcd')).error).toMatch(/4 digits/)
    expect((await setAthletePin(athleteId, '')).error).toMatch(/4 digits/)
  })

  it('hashes the PIN and saves to database', async () => {
    const mock = createQueueMock()
    mock.enqueue('athletes', { data: null })
    mockBcryptHash.mockResolvedValue('$2a$10$hashedpin')
    mockFrom.mockImplementation(mock.impl)

    const result = await setAthletePin(athleteId, '5678')
    expect(result.success).toBe(true)
    expect(mockBcryptHash).toHaveBeenCalledWith('5678', 10)
    expect(mock.updates['athletes']).toBe(1)
  })

  it('returns error on database failure', async () => {
    const mock = createQueueMock()
    mock.enqueue('athletes', { data: null, error: { code: 'SOME_ERROR' } })
    mockBcryptHash.mockResolvedValue('$2a$10$hashedpin')
    mockFrom.mockImplementation(mock.impl)

    const result = await setAthletePin(athleteId, '5678')
    expect(result.error).toMatch(/could not save/i)
  })
})

// ── sendAthleteMessage ──────────────────────────────────────────────────────

describe('sendAthleteMessage', () => {
  const athleteId = 'athlete-1'

  it('rejects non-preset messages', async () => {
    const result = await sendAthleteMessage(athleteId, 'Custom message')
    expect(result.error).toMatch(/choose one of the message options/i)
  })

  it('rejects empty messages', async () => {
    const result = await sendAthleteMessage(athleteId, '')
    expect(result.error).toMatch(/choose one of the message options/i)
  })

  it('allows preset messages', async () => {
    const mock = createQueueMock()
    // Rate limit check
    mock.enqueue('athlete_messages', { data: null, count: 0 })
    // Insert
    mock.enqueue('athlete_messages', { data: null })
    mockFrom.mockImplementation(mock.impl)

    const result = await sendAthleteMessage(athleteId, 'Thank you!')
    expect(result.success).toBe(true)
  })

  it('rate limits after 5 messages per day', async () => {
    const mock = createQueueMock()
    // Rate limit check returns 5 messages
    mock.enqueue('athlete_messages', { data: null, count: 5 })
    mockFrom.mockImplementation(mock.impl)

    const result = await sendAthleteMessage(athleteId, 'That was fun!')
    expect(result.error).toMatch(/enough messages for today/i)
  })

  it('allows all four preset messages', async () => {
    const presets = ['Thank you!', 'That was fun!', 'I want to run more!', 'See you next week!']

    for (const msg of presets) {
      const mock = createQueueMock()
      mock.enqueue('athlete_messages', { data: null, count: 0 })
      mock.enqueue('athlete_messages', { data: null })
      mockFrom.mockImplementation(mock.impl)

      const result = await sendAthleteMessage(athleteId, msg)
      expect(result.success).toBe(true)
    }
  })

  it('returns error on insert failure', async () => {
    const mock = createQueueMock()
    mock.enqueue('athlete_messages', { data: null, count: 0 })
    mock.enqueue('athlete_messages', { data: null, error: { code: 'INSERT_ERROR' } })
    mockFrom.mockImplementation(mock.impl)

    const result = await sendAthleteMessage(athleteId, 'Thank you!')
    expect(result.error).toMatch(/could not send/i)
  })
})

// ── verifyAthleteCookie ─────────────────────────────────────────────────────

describe('verifyAthleteCookie', () => {
  it('returns true when cookie is valid', async () => {
    mockCookieGet.mockReturnValue({ value: 'verified' })
    const result = await verifyAthleteCookie('athlete-1')
    expect(result).toBe(true)
  })

  it('returns false when cookie is missing', async () => {
    mockCookieGet.mockReturnValue(undefined)
    const result = await verifyAthleteCookie('athlete-1')
    expect(result).toBe(false)
  })

  it('returns false when cookie has wrong value', async () => {
    mockCookieGet.mockReturnValue({ value: 'invalid' })
    const result = await verifyAthleteCookie('athlete-1')
    expect(result).toBe(false)
  })

  it('uses correct cookie name with athlete ID', async () => {
    mockCookieGet.mockReturnValue({ value: 'verified' })
    await verifyAthleteCookie('abc-123')
    expect(mockCookieGet).toHaveBeenCalledWith('athlete_session_abc-123')
  })
})
