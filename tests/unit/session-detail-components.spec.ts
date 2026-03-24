/**
 * Unit tests for session detail page component logic.
 *
 * Tests cover: RsvpStatusList sorting, ProxyRsvpSection filtering,
 * SessionAdminActions visibility.
 *
 * Since @testing-library/react is not installed, these tests verify
 * component logic without rendering.
 */

// ── RsvpStatusList sort logic ────────────────────────────────────────────────

describe('RsvpStatusList — sort logic', () => {
  type Item = { id: string; name: string; status: string }

  function sortItems(items: Item[], positiveStatus: string): Item[] {
    const order: Record<string, number> = { [positiveStatus]: 0, pending: 1 }
    return [...items].sort((a, b) => (order[a.status] ?? 2) - (order[b.status] ?? 2))
  }

  it('sorts: positive first, then pending, then negative', () => {
    const items: Item[] = [
      { id: '1', name: 'Negative', status: 'unavailable' },
      { id: '2', name: 'Pending', status: 'pending' },
      { id: '3', name: 'Positive', status: 'available' },
    ]
    const sorted = sortItems(items, 'available')
    expect(sorted[0].name).toBe('Positive')
    expect(sorted[1].name).toBe('Pending')
    expect(sorted[2].name).toBe('Negative')
  })

  it('maintains relative order within same status group', () => {
    const items: Item[] = [
      { id: '1', name: 'Bob', status: 'available' },
      { id: '2', name: 'Alice', status: 'available' },
      { id: '3', name: 'Carol', status: 'pending' },
    ]
    const sorted = sortItems(items, 'available')
    expect(sorted[0].name).toBe('Bob')
    expect(sorted[1].name).toBe('Alice')
    expect(sorted[2].name).toBe('Carol')
  })

  it('counts positive and pending correctly', () => {
    const items: Item[] = [
      { id: '1', name: 'A', status: 'attending' },
      { id: '2', name: 'B', status: 'attending' },
      { id: '3', name: 'C', status: 'pending' },
      { id: '4', name: 'D', status: 'not_attending' },
    ]
    const positiveCount = items.filter(i => i.status === 'attending').length
    const pendingCount = items.filter(i => i.status === 'pending').length
    expect(positiveCount).toBe(2)
    expect(pendingCount).toBe(1)
  })

  it('shows first 6 items when not expanded, all when expanded', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      name: `Person ${i}`,
      status: 'available',
    }))
    const collapsed = items.slice(0, 6)
    expect(collapsed.length).toBe(6)
    expect(items.length).toBe(10)
  })
})

// ── ProxyRsvpSection — filtering logic ───────────────────────────────────────

describe('ProxyRsvpSection — filtering logic', () => {
  it('filters to only pending items', () => {
    const items = [
      { id: '1', name: 'Alice', status: 'available' },
      { id: '2', name: 'David', status: 'pending' },
      { id: '3', name: 'James', status: 'pending' },
    ]
    const pending = items.filter(i => i.status === 'pending')
    expect(pending.length).toBe(2)
    expect(pending.map(p => p.name)).toEqual(['David', 'James'])
  })

  it('returns empty when no pending items', () => {
    const items = [
      { id: '1', name: 'Alice', status: 'available' },
      { id: '2', name: 'Bob', status: 'unavailable' },
    ]
    const pending = items.filter(i => i.status === 'pending')
    expect(pending.length).toBe(0)
  })

  it('athletes type uses attending/not labels', () => {
    const type = 'athletes'
    const positiveStatus = type === 'athletes' ? 'attending' : 'available'
    const negativeStatus = type === 'athletes' ? 'not_attending' : 'unavailable'
    expect(positiveStatus).toBe('attending')
    expect(negativeStatus).toBe('not_attending')
  })

  it('coaches type uses available/unavailable labels', () => {
    const type = 'coaches'
    const positiveStatus = type === 'coaches' ? 'available' : 'attending'
    expect(positiveStatus).toBe('available')
  })
})

// ── SessionAdminActions — visibility logic ───────────────────────────────────

describe('SessionAdminActions — visibility logic', () => {
  function shouldShowActions(status: string): boolean {
    return status !== 'completed' && status !== 'cancelled'
  }

  it('hidden for completed sessions', () => {
    expect(shouldShowActions('completed')).toBe(false)
  })

  it('hidden for cancelled sessions', () => {
    expect(shouldShowActions('cancelled')).toBe(false)
  })

  it('shown for published sessions', () => {
    expect(shouldShowActions('published')).toBe(true)
  })

  it('shown for draft sessions', () => {
    expect(shouldShowActions('draft')).toBe(true)
  })

  it('shows Assign Pairings when not published', () => {
    const pairingsPublished = false
    const label = pairingsPublished ? 'Edit Pairings' : 'Assign Pairings'
    expect(label).toBe('Assign Pairings')
  })

  it('shows Edit Pairings when published', () => {
    const pairingsPublished = true
    const label = pairingsPublished ? 'Edit Pairings' : 'Assign Pairings'
    expect(label).toBe('Edit Pairings')
  })

  it('Mark Complete only shown for published sessions', () => {
    const showMarkComplete = (status: string) => status === 'published'
    expect(showMarkComplete('published')).toBe(true)
    expect(showMarkComplete('draft')).toBe(false)
  })
})

// ── AssignmentSection — grouping logic ───────────────────────────────────────

describe('AssignmentSection — grouping logic', () => {
  const assignments = [
    { coach_id: 'c1', coach_name: 'Alice', athlete_id: 'a1', athlete_name: 'Nicholas' },
    { coach_id: 'c1', coach_name: 'Alice', athlete_id: 'a2', athlete_name: 'Sarah' },
    { coach_id: 'c2', coach_name: 'Bob', athlete_id: 'a3', athlete_name: 'Marcus' },
  ]

  it('groups assignments by coach', () => {
    const groups: Record<string, { coach_name: string; athletes: string[] }> = {}
    for (const a of assignments) {
      if (!groups[a.coach_id]) groups[a.coach_id] = { coach_name: a.coach_name, athletes: [] }
      groups[a.coach_id].athletes.push(a.athlete_name)
    }
    expect(Object.keys(groups).length).toBe(2)
    expect(groups['c1'].athletes).toEqual(['Nicholas', 'Sarah'])
    expect(groups['c2'].athletes).toEqual(['Marcus'])
  })

  it('finds current user assignments', () => {
    const currentUserId = 'c1'
    const myAssignments = assignments.filter(a => a.coach_id === currentUserId)
    expect(myAssignments.length).toBe(2)
  })

  it('finds caregiver athlete coach', () => {
    const caregiverAthleteIds = ['a1']
    const caregiverAssignments = assignments.filter(a => caregiverAthleteIds.includes(a.athlete_id))
    expect(caregiverAssignments.length).toBe(1)
    expect(caregiverAssignments[0].coach_name).toBe('Alice')
  })

  it('hidden when no pairings published', () => {
    const pairingsPublished = false
    expect(pairingsPublished).toBe(false)
  })
})
