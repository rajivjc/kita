// ── Mocks (must be before imports) ───────────────────────────────────────────

const mockFrom = jest.fn()

jest.mock('@/lib/supabase/admin', () => ({
  adminClient: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

const mockGetUser = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
  }),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

import { getExportData } from '@/lib/export'

// ── Helpers ──────────────────────────────────────────────────────────────────

function createQueueMock() {
  const queues: Record<string, Array<{ data: unknown; error: unknown }>> = {}

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
        return (..._args: unknown[]) => new Proxy(obj, handler)
      },
    }
    return new Proxy(obj, handler)
  }

  return { enqueue, impl }
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ── Tests ────────────────────────────────────────────────────────────────────

describe('getExportData', () => {
  it('rejects unauthenticated requests', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getExportData('some-id')
    expect(result).toHaveProperty('error')
  })

  it('rejects caregiver role', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const mock = createQueueMock()
    mock.enqueue('users', { data: { role: 'caregiver' } })
    mockFrom.mockImplementation(mock.impl)

    const result = await getExportData('some-id')
    expect(result).toHaveProperty('error')
    expect(result.error).toMatch(/unauthorized/i)
  })

  it('returns formatted session data for coach', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'coach-1' } } })

    const mock = createQueueMock()
    mock.enqueue('users', { data: { role: 'coach' } })
    mock.enqueue('athletes', { data: { name: 'Nicholas Tan' } })
    mock.enqueue('sessions', {
      data: [
        {
          date: '2026-03-15',
          distance_km: 5,
          duration_seconds: 1800,
          feel: 4,
          note: 'Strong effort today',
          sync_source: 'manual',
        },
        {
          date: '2026-03-10',
          distance_km: 3.5,
          duration_seconds: 1500,
          feel: null,
          note: null,
          sync_source: 'strava_webhook',
        },
        {
          date: '2026-03-05',
          distance_km: 0,
          duration_seconds: 600,
          feel: 3,
          note: 'Walk only',
          sync_source: 'manual',
        },
      ],
    })
    mockFrom.mockImplementation(mock.impl)

    const result = await getExportData('athlete-1')

    expect(result.error).toBeUndefined()
    expect(result.athleteName).toBe('Nicholas Tan')
    expect(result.data).toHaveLength(3)

    // First session: 5km in 30 min = 6:00 pace
    const s1 = result.data![0]
    expect(s1.distance_km).toBe(5)
    expect(s1.duration_min).toBe(30)
    expect(s1.pace_min_km).toBe('6:00')
    expect(s1.feel_rating).toBe(4)
    expect(s1.coach_notes).toBe('Strong effort today')
    expect(s1.source).toBe('manual')
    expect(s1.date).toMatch(/15 Mar 2026/)

    // Second session: strava source
    const s2 = result.data![1]
    expect(s2.source).toBe('strava')
    expect(s2.feel_rating).toBeNull()
    expect(s2.coach_notes).toBe('')

    // Third session: 0 distance = empty pace
    const s3 = result.data![2]
    expect(s3.pace_min_km).toBe('')
    expect(s3.distance_km).toBe(0)
  })
})
