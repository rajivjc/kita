/**
 * Unit tests for focus area server actions and setAthleteGoal goal tracking.
 *
 * Tests:
 * 1. saveFocusArea creates a new focus when none exists
 * 2. saveFocusArea returns error when active focus already exists
 * 3. saveFocusArea updates existing focus when id provided
 * 4. achieveFocus sets status to achieved
 * 5. updateAthleteGoal saves goal fields on athlete
 * 6. setAthleteGoal tracks previous choice when changing
 * 7. setAthleteGoal does not set previous when first time picking
 * 8. setAthleteGoal does not change previous when picking same goal
 */

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

const mockRevalidatePath = jest.fn()

jest.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
  unstable_cache: (fn: Function) => fn,
}))

// Mock next/headers for setAthleteGoal (cookie-based auth)
const mockCookieGet = jest.fn()
const mockCookieSet = jest.fn()

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: (...args: unknown[]) => mockCookieGet(...args),
    set: (...args: unknown[]) => mockCookieSet(...args),
  }),
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

import { saveFocusArea, achieveFocus, updateAthleteGoal } from '@/app/athletes/[id]/actions'
import { setAthleteGoal } from '@/app/my/[athleteId]/actions'

// ── Helpers ───────────────────────────────────────────────────────────────────

function createQueueMock() {
  const queues: Record<string, Array<{ data: unknown; error: unknown }>> = {}
  const updatePayloads: Record<string, unknown[]> = {}
  const insertPayloads: Record<string, unknown[]> = {}

  function enqueue(table: string, ...responses: Array<{ data: unknown; error?: unknown }>) {
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
        if (prop === 'update') {
          return (payload: unknown) => {
            if (!updatePayloads[table]) updatePayloads[table] = []
            updatePayloads[table].push(payload)
            return new Proxy(obj, handler)
          }
        }
        if (prop === 'insert') {
          return (payload: unknown) => {
            if (!insertPayloads[table]) insertPayloads[table] = []
            insertPayloads[table].push(payload)
            return new Proxy(obj, handler)
          }
        }
        return (..._args: unknown[]) => new Proxy(obj, handler)
      },
    }
    return new Proxy(obj, handler)
  }

  return { enqueue, impl, updatePayloads, insertPayloads }
}

const userId = 'user-123'
const athleteId = 'athlete-456'
const focusId = 'focus-789'

beforeEach(() => {
  jest.clearAllMocks()
})

// ── saveFocusArea ────────────────────────────────────────────────────────────

describe('saveFocusArea', () => {
  it('creates a new focus when none exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } } })
    const mock = createQueueMock()
    // 1. users role check
    mock.enqueue('users', { data: { role: 'coach' } })
    // 2. check existing active focus areas (none)
    mock.enqueue('focus_areas', { data: [] })
    // 3. insert result
    mock.enqueue('focus_areas', {
      data: {
        id: focusId,
        athlete_id: athleteId,
        title: 'Walk-run intervals',
        progress_level: 'just_started',
        status: 'active',
        progress_note: null,
        created_by: userId,
        created_at: '2026-03-23T00:00:00Z',
        achieved_at: null,
        updated_at: '2026-03-23T00:00:00Z',
      },
    })
    mockFrom.mockImplementation((table: string) => mock.impl(table))

    const result = await saveFocusArea(athleteId, {
      title: 'Walk-run intervals',
      progress_level: 'just_started',
    })

    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
    expect(result.data?.status).toBe('active')
    expect(mock.insertPayloads['focus_areas']).toBeDefined()
    expect(mock.insertPayloads['focus_areas']![0]).toMatchObject({
      athlete_id: athleteId,
      title: 'Walk-run intervals',
      progress_level: 'just_started',
      status: 'active',
    })
  })

  it('returns error when active focus already exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } } })
    const mock = createQueueMock()
    mock.enqueue('users', { data: { role: 'coach' } })
    // Existing active focus found
    mock.enqueue('focus_areas', { data: [{ id: 'existing-focus' }] })
    mockFrom.mockImplementation((table: string) => mock.impl(table))

    const result = await saveFocusArea(athleteId, {
      title: 'New focus',
    })

    expect(result.error).toBe('This athlete already has an active focus. Mark it as achieved first.')
    expect(result.data).toBeUndefined()
  })

  it('updates existing focus when id provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } } })
    const mock = createQueueMock()
    mock.enqueue('users', { data: { role: 'coach' } })
    // Update result
    mock.enqueue('focus_areas', {
      data: {
        id: focusId,
        athlete_id: athleteId,
        title: 'Updated title',
        progress_level: 'making_progress',
        status: 'active',
        progress_note: 'Good progress',
        created_by: userId,
        created_at: '2026-03-23T00:00:00Z',
        achieved_at: null,
        updated_at: '2026-03-23T10:00:00Z',
      },
    })
    mockFrom.mockImplementation((table: string) => mock.impl(table))

    const result = await saveFocusArea(athleteId, {
      id: focusId,
      title: 'Updated title',
      progress_note: 'Good progress',
    })

    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
    expect(mock.updatePayloads['focus_areas']).toBeDefined()
    expect(mock.updatePayloads['focus_areas']![0]).toMatchObject({
      title: 'Updated title',
      progress_note: 'Good progress',
    })
    // updated_at should be refreshed
    expect((mock.updatePayloads['focus_areas']![0] as Record<string, unknown>).updated_at).toBeDefined()
  })
})

// ── achieveFocus ─────────────────────────────────────────────────────────────

describe('achieveFocus', () => {
  it('sets status to achieved', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } } })
    const mock = createQueueMock()
    mock.enqueue('users', { data: { role: 'coach' } })
    mock.enqueue('focus_areas', { data: null, error: null })
    mockFrom.mockImplementation((table: string) => mock.impl(table))

    const result = await achieveFocus(focusId, athleteId)

    expect(result.error).toBeUndefined()
    expect(mock.updatePayloads['focus_areas']).toBeDefined()
    const payload = mock.updatePayloads['focus_areas']![0] as Record<string, unknown>
    expect(payload.status).toBe('achieved')
    expect(payload.progress_level).toBe('achieved')
    expect(payload.achieved_at).toBeDefined()
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/athletes/${athleteId}`)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/feed')
  })
})

// ── updateAthleteGoal ────────────────────────────────────────────────────────

describe('updateAthleteGoal', () => {
  it('saves goal fields on athlete', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } } })
    const mock = createQueueMock()
    mock.enqueue('users', { data: { role: 'coach' } })
    mock.enqueue('athletes', { data: null, error: null })
    mockFrom.mockImplementation((table: string) => mock.impl(table))

    const result = await updateAthleteGoal(athleteId, {
      running_goal: 'Run 5km',
      goal_type: 'distance_total',
      goal_target: 5,
    })

    expect(result.error).toBeUndefined()
    expect(mock.updatePayloads['athletes']).toBeDefined()
    expect(mock.updatePayloads['athletes']![0]).toMatchObject({
      running_goal: 'Run 5km',
      goal_type: 'distance_total',
      goal_target: 5,
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/athletes/${athleteId}`)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/feed')
  })
})

// ── setAthleteGoal (goal tracking) ───────────────────────────────────────────

describe('setAthleteGoal', () => {
  beforeEach(() => {
    // Simulate verified cookie
    mockCookieGet.mockReturnValue({ value: 'verified' })
  })

  it('tracks previous choice when changing', async () => {
    const mock = createQueueMock()
    // 1. Read current athlete
    mock.enqueue('athletes', {
      data: {
        athlete_goal_choice: 'run_further',
        goal_choice_updated_at: '2026-01-01T00:00:00Z',
      },
    })
    // 2. Update result
    mock.enqueue('athletes', { data: null, error: null })
    mockFrom.mockImplementation((table: string) => mock.impl(table))

    const result = await setAthleteGoal(athleteId, 'feel_stronger')

    expect(result.error).toBeUndefined()
    expect(result.success).toBe(true)
    expect(mock.updatePayloads['athletes']).toBeDefined()
    const payload = mock.updatePayloads['athletes']![0] as Record<string, unknown>
    expect(payload.athlete_goal_choice).toBe('feel_stronger')
    expect(payload.previous_goal_choice).toBe('run_further')
    expect(payload.previous_goal_choice_at).toBe('2026-01-01T00:00:00Z')
    expect(payload.goal_choice_updated_at).toBeDefined()
  })

  it('does not set previous when first time picking', async () => {
    const mock = createQueueMock()
    mock.enqueue('athletes', {
      data: {
        athlete_goal_choice: null,
        goal_choice_updated_at: null,
      },
    })
    mock.enqueue('athletes', { data: null, error: null })
    mockFrom.mockImplementation((table: string) => mock.impl(table))

    const result = await setAthleteGoal(athleteId, 'run_further')

    expect(result.error).toBeUndefined()
    expect(result.success).toBe(true)
    expect(mock.updatePayloads['athletes']).toBeDefined()
    const payload = mock.updatePayloads['athletes']![0] as Record<string, unknown>
    expect(payload.athlete_goal_choice).toBe('run_further')
    expect(payload.previous_goal_choice).toBeUndefined()
    expect(payload.goal_choice_updated_at).toBeDefined()
  })

  it('does not change previous when picking same goal', async () => {
    const mock = createQueueMock()
    mock.enqueue('athletes', {
      data: {
        athlete_goal_choice: 'run_further',
        goal_choice_updated_at: '2026-01-01T00:00:00Z',
      },
    })
    mock.enqueue('athletes', { data: null, error: null })
    mockFrom.mockImplementation((table: string) => mock.impl(table))

    const result = await setAthleteGoal(athleteId, 'run_further')

    expect(result.error).toBeUndefined()
    expect(result.success).toBe(true)
    expect(mock.updatePayloads['athletes']).toBeDefined()
    const payload = mock.updatePayloads['athletes']![0] as Record<string, unknown>
    expect(payload.athlete_goal_choice).toBe('run_further')
    expect(payload.previous_goal_choice).toBeUndefined()
    expect(payload.goal_choice_updated_at).toBeDefined()
  })
})
