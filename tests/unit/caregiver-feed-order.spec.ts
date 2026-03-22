import { readFileSync } from 'fs'
import { join } from 'path'

function readSrc(path: string): string {
  return readFileSync(join(__dirname, '..', '..', 'src', path), 'utf-8')
}

describe('Caregiver feed restructure', () => {
  const source = readSrc('components/feed/CaregiverFeed.tsx')

  test('Greeting card shows monthly stats', () => {
    // The greeting card should use monthlySummary data (runs, km, pace)
    expect(source).toContain('monthlySummary.thisMonth.runs')
    expect(source).toContain('monthlySummary.thisMonth.km.toFixed(1)')
    expect(source).toContain('km total')
    expect(source).toContain('per km avg')
    // Should use formatPace for pace calculation
    expect(source).toContain('formatPace')
    // Should show feel emojis from recent sessions
    expect(source).toContain('FEEL_EMOJI')
    expect(source).toContain('recent feels')
  })

  test('Greeting card shows vs last month comparison', () => {
    // Should compute avg distances and show comparison
    expect(source).toContain('avgDistanceLast')
    expect(source).toContain('avgDistanceThis')
    expect(source).toContain('vs last month')
    // Trend icon should show ↑ when positive
    expect(source).toContain("distanceTrend > 0.05 ? '↑'")
    expect(source).toContain('trendIcon')
    expect(source).toContain('trendColor')
  })

  test('Greeting card hides comparison when no last month data', () => {
    // The comparison is conditional on lastMonth.runs > 0
    expect(source).toContain('monthlySummary.lastMonth.runs > 0')
  })

  test('Coach notes appear before digest teaser', () => {
    const notesPos = source.indexOf('CaregiverNotesCard')
    const digestPos = source.indexOf('DigestTeaser')
    // CaregiverNotesCard import will appear first, so find the JSX usage
    const notesJsxPos = source.indexOf('<CaregiverNotesCard')
    const digestJsxPos = source.indexOf('<DigestTeaser')
    expect(notesJsxPos).toBeGreaterThan(-1)
    expect(digestJsxPos).toBeGreaterThan(-1)
    expect(notesJsxPos).toBeLessThan(digestJsxPos)
  })

  test('CaregiverMonthlySummary is not rendered', () => {
    // The standalone CaregiverMonthlySummary component should not be called
    expect(source).not.toContain('<CaregiverMonthlySummary')
    // The import should also be removed
    expect(source).not.toContain("import CaregiverMonthlySummary from")
    // But the monthly data should still be used inline in the greeting card
    expect(source).toContain('monthlySummary.thisMonth')
  })

  test('Empty month — greeting shows no-sessions message', () => {
    // When no sessions, should show a message about no runs
    expect(source).toContain('No runs logged for')
    expect(source).toContain('this month yet')
    // The stats grid is conditional on sessions existing
    expect(source).toContain('caregiverRecentSessions.length === 0')
  })
})
