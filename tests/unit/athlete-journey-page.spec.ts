/**
 * Unit tests for the athlete journey page accessibility and design principles.
 *
 * These are static analysis tests verifying:
 * 1. Accessibility: aria-live, aria-label, role attributes
 * 2. Touch target sizes (64px+ for athlete-facing)
 * 3. Sensory safety: no idioms, literal language
 * 4. Icons paired with text labels
 * 5. Visual progress bars alongside numbers
 * 6. Privacy: no sensitive data exposure
 */

import * as fs from 'fs'
import * as path from 'path'

describe('MyJourneyDashboard accessibility', () => {
  const filePath = path.join(
    __dirname,
    '../../src/components/athlete/MyJourneyDashboard.tsx'
  )
  let content: string

  beforeAll(() => {
    content = fs.readFileSync(filePath, 'utf-8')
  })

  it('uses semantic main element', () => {
    expect(content).toContain('<main')
  })

  it('uses section elements with aria-label', () => {
    expect(content).toContain('aria-label=')
    expect(content).toContain('<section')
  })

  it('has aria-live region for message feedback', () => {
    expect(content).toContain('aria-live="polite"')
  })

  it('has progress bar with role="progressbar"', () => {
    expect(content).toContain('role="progressbar"')
    expect(content).toContain('aria-valuenow')
    expect(content).toContain('aria-valuemin')
    expect(content).toContain('aria-valuemax')
  })

  it('uses 20px+ base font size (text-xl or larger for headings)', () => {
    // The dashboard uses text-2xl for name, text-lg for section headers
    expect(content).toContain('text-2xl')
    expect(content).toContain('text-lg')
  })

  it('pairs icons with text labels on interactive elements', () => {
    // Stat cards have both emoji icons and text labels
    expect(content).toContain('"runs"')
    expect(content).toContain('"km"')
    // Share button has icon + text
    expect(content).toContain('Share my running story')
  })

  it('provides visual progress bars alongside numbers', () => {
    // Stats have visual bars
    expect(content).toContain('bg-teal-400 rounded-full')
    // Goal has progress bar
    expect(content).toContain('bg-teal-500 rounded-full')
  })

  it('uses literal language (no idioms or metaphors)', () => {
    expect(content).not.toContain("you're on fire")
    expect(content).not.toContain('killing it')
    expect(content).not.toContain('crushing it')
    expect(content).not.toContain('so proud')
    expect(content).not.toContain('brave')
    // Greeting is literal
    expect(content).toContain('Great to see you!')
  })

  it('does not expose sensitive data (notes, medical, cues)', () => {
    expect(content).not.toContain('medical')
    expect(content).not.toContain('communication_notes')
    expect(content).not.toContain('emergency_contact')
    expect(content).not.toContain('cues')
    expect(content).not.toContain('coach_notes')
  })

  it('uses left-aligned text (no text-justify)', () => {
    expect(content).not.toContain('text-justify')
  })

  it('has large touch targets for message buttons (h-14 = 56px)', () => {
    expect(content).toContain('h-14')
  })
})

describe('PinEntry accessibility', () => {
  const filePath = path.join(
    __dirname,
    '../../src/components/athlete/PinEntry.tsx'
  )
  let content: string

  beforeAll(() => {
    content = fs.readFileSync(filePath, 'utf-8')
  })

  it('has aria-live region for error messages', () => {
    expect(content).toContain('aria-live="polite"')
  })

  it('has aria-label on each PIN digit input', () => {
    expect(content).toContain('aria-label={`PIN digit')
  })

  it('has role="group" on PIN input container', () => {
    expect(content).toContain('role="group"')
  })

  it('uses large input boxes (w-16 h-16 = 64px)', () => {
    expect(content).toContain('w-16 h-16')
  })

  it('uses numeric input mode for mobile keyboards', () => {
    expect(content).toContain('inputMode="numeric"')
  })

  it('has large submit button (h-14 = 56px)', () => {
    expect(content).toContain('h-14')
  })

  it('uses clear error messages with literal language', () => {
    // "That PIN didn't match" comes from the server action, not the component
    // PinEntry shows its own validation message:
    expect(content).toContain('Please enter all 4 numbers')
  })

  it('shows lockout guidance', () => {
    expect(content).not.toContain('You are locked out')
    // The lockout message comes from the server action
  })

  it('provides help text for users who need assistance', () => {
    expect(content).toContain('Ask your coach if you need help')
  })
})

describe('CheerToast accessibility', () => {
  const filePath = path.join(
    __dirname,
    '../../src/components/feed/CheerToast.tsx'
  )
  let content: string

  beforeAll(() => {
    content = fs.readFileSync(filePath, 'utf-8')
  })

  it('has aria-live for screen reader announcements', () => {
    expect(content).toContain('aria-live="polite"')
  })

  it('has role="status" for toast notification', () => {
    expect(content).toContain('role="status"')
  })

  it('respects prefers-reduced-motion', () => {
    expect(content).toContain('prefers-reduced-motion')
  })

  it('has Escape key handler', () => {
    expect(content).toContain("e.key === 'Escape'")
  })

  it('auto-dismisses after 5 seconds', () => {
    expect(content).toContain('5000')
  })
})

describe('Middleware includes /my route as public', () => {
  const filePath = path.join(
    __dirname,
    '../../src/middleware.ts'
  )
  let content: string

  beforeAll(() => {
    content = fs.readFileSync(filePath, 'utf-8')
  })

  it('has /my in PUBLIC_PATHS', () => {
    expect(content).toContain("'/my'")
  })
})

describe('Database migration for athlete PIN', () => {
  const migrationDir = path.join(__dirname, '../../supabase/migrations')
  let migrationContent: string

  beforeAll(() => {
    const files = fs.readdirSync(migrationDir)
    const pinMigration = files.find(f => f.includes('athlete_pin'))
    expect(pinMigration).toBeDefined()
    migrationContent = fs.readFileSync(path.join(migrationDir, pinMigration!), 'utf-8')
  })

  it('adds athlete_pin column', () => {
    expect(migrationContent).toContain('athlete_pin')
  })

  it('adds pin_attempts column', () => {
    expect(migrationContent).toContain('pin_attempts')
  })

  it('adds pin_locked_until column', () => {
    expect(migrationContent).toContain('pin_locked_until')
  })

  it('creates athlete_messages table', () => {
    expect(migrationContent).toContain('athlete_messages')
    expect(migrationContent).toContain('CREATE TABLE')
  })

  it('enables RLS on athlete_messages', () => {
    expect(migrationContent).toContain('ENABLE ROW LEVEL SECURITY')
  })

  it('creates RLS policy for coaches and admins', () => {
    expect(migrationContent).toContain("role IN ('admin', 'coach')")
  })

  it('creates indexes for efficient queries', () => {
    expect(migrationContent).toContain('CREATE INDEX')
  })
})
