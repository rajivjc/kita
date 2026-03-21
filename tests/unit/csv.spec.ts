import { formatSessionsAsCSV } from '@/lib/csv'
import type { ExportSession } from '@/lib/export'

function makeSession(overrides: Partial<ExportSession> = {}): ExportSession {
  return {
    date: '15 Mar 2026',
    distance_km: 5,
    duration_min: 30,
    pace_min_km: '6:00',
    feel_rating: 4,
    coach_notes: 'Good session',
    source: 'manual',
    ...overrides,
  }
}

describe('formatSessionsAsCSV', () => {
  it('formats sessions as CSV with header row', () => {
    const sessions = [
      makeSession(),
      makeSession({ date: '10 Mar 2026', distance_km: 3.5, duration_min: 25 }),
    ]

    const csv = formatSessionsAsCSV(sessions)

    expect(csv.startsWith('\uFEFF')).toBe(true)

    const lines = csv.replace('\uFEFF', '').split('\n')
    expect(lines[0]).toBe('Date,Distance (km),Duration (min),Pace (min/km),Feel Rating,Coach Notes,Source')
    expect(lines).toHaveLength(3) // header + 2 data rows
    expect(lines[1]).toContain('15 Mar 2026')
    expect(lines[2]).toContain('10 Mar 2026')
  })

  it('escapes coach notes with double quotes when they contain commas', () => {
    const sessions = [
      makeSession({ coach_notes: 'Ran well, needs more warmup' }),
    ]

    const csv = formatSessionsAsCSV(sessions)
    expect(csv).toContain('"Ran well, needs more warmup"')
  })

  it('escapes coach notes with internal double quotes', () => {
    const sessions = [
      makeSession({ coach_notes: 'He said "great job"' }),
    ]

    const csv = formatSessionsAsCSV(sessions)
    expect(csv).toContain('"He said ""great job"""')
  })

  it('handles empty session array', () => {
    const csv = formatSessionsAsCSV([])

    expect(csv.startsWith('\uFEFF')).toBe(true)
    const lines = csv.replace('\uFEFF', '').split('\n')
    expect(lines).toHaveLength(1) // header only
    expect(lines[0]).toBe('Date,Distance (km),Duration (min),Pace (min/km),Feel Rating,Coach Notes,Source')
  })

  it('handles null feel rating', () => {
    const sessions = [
      makeSession({ feel_rating: null }),
    ]

    const csv = formatSessionsAsCSV(sessions)
    const lines = csv.replace('\uFEFF', '').split('\n')
    const dataFields = lines[1].split(',')
    // Feel rating is the 5th field (index 4)
    expect(dataFields[4]).toBe('')
  })
})
