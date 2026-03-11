/**
 * Unit tests for CelebrationOverlay safety properties.
 *
 * These tests verify:
 * 1. No seizure-risk red (#EF4444) in confetti colors
 * 2. Confetti rotation is reduced (not 720deg)
 * 3. The component has proper accessibility attributes
 * 4. The CONFETTI_COLORS array is properly defined
 */

import * as fs from 'fs'
import * as path from 'path'

describe('CelebrationOverlay safety', () => {
  const filePath = path.join(
    __dirname,
    '../../src/components/milestone/CelebrationOverlay.tsx'
  )
  let fileContent: string

  beforeAll(() => {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  })

  it('does not contain seizure-risk red (#EF4444)', () => {
    expect(fileContent).not.toContain('#EF4444')
    expect(fileContent).not.toContain('#ef4444')
  })

  it('uses soft coral (#FB923C) instead of red', () => {
    expect(fileContent).toContain('#FB923C')
  })

  it('has reduced confetti rotation (not 720deg)', () => {
    expect(fileContent).not.toContain('720deg')
    // Should use 180deg or less
    expect(fileContent).toContain('180deg')
  })

  it('has role="dialog" for accessibility', () => {
    expect(fileContent).toContain('role="dialog"')
  })

  it('has aria-label for screen readers', () => {
    expect(fileContent).toContain('aria-label')
  })

  it('has aria-hidden on confetti container', () => {
    expect(fileContent).toContain('aria-hidden="true"')
  })

  it('has close button with aria-label', () => {
    expect(fileContent).toContain('aria-label="Close celebration"')
  })

  it('respects prefers-reduced-motion', () => {
    expect(fileContent).toContain('prefers-reduced-motion')
    // Should hide confetti for reduced motion
    expect(fileContent).toContain('.celebration-confetti')
  })

  it('has Escape key handler for dismissal', () => {
    expect(fileContent).toContain("e.key === 'Escape'")
  })

  it('has auto-dismiss timer', () => {
    expect(fileContent).toContain('setTimeout(dismiss')
  })
})

describe('BadgeCelebrationOverlay safety', () => {
  const filePath = path.join(
    __dirname,
    '../../src/components/celebration/BadgeCelebrationOverlay.tsx'
  )
  let fileContent: string

  beforeAll(() => {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  })

  it('has role="dialog" for accessibility', () => {
    expect(fileContent).toContain('role="dialog"')
  })

  it('has aria-label', () => {
    expect(fileContent).toContain('aria-label')
  })

  it('respects prefers-reduced-motion', () => {
    expect(fileContent).toContain('prefers-reduced-motion')
  })

  it('has Escape key handler', () => {
    expect(fileContent).toContain("e.key === 'Escape'")
  })

  it('has close button', () => {
    expect(fileContent).toContain('aria-label="Close celebration"')
  })

  it('uses warm amber/gold gradient (not teal)', () => {
    expect(fileContent).toContain('amber')
    expect(fileContent).toContain('orange')
  })

  it('auto-dismisses after 6 seconds', () => {
    expect(fileContent).toContain('6000')
  })
})

describe('FirstRunOverlay safety', () => {
  const filePath = path.join(
    __dirname,
    '../../src/components/celebration/FirstRunOverlay.tsx'
  )
  let fileContent: string

  beforeAll(() => {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  })

  it('has role="dialog"', () => {
    expect(fileContent).toContain('role="dialog"')
  })

  it('has Escape key handler', () => {
    expect(fileContent).toContain("e.key === 'Escape'")
  })

  it('does not use confetti animation', () => {
    // No confetti CSS classes (comments mentioning confetti are okay)
    expect(fileContent).not.toContain('confettiFall')
    expect(fileContent).not.toContain('CONFETTI_COLORS')
    expect(fileContent).not.toContain('confetti-piece')
  })

  it('uses literal language (not metaphorical)', () => {
    // Should say "A new journey begins" — which is acceptable literal language
    expect(fileContent).toContain('A new journey begins')
    // Should NOT contain idioms
    expect(fileContent).not.toContain("you're on fire")
    expect(fileContent).not.toContain('killing it')
    expect(fileContent).not.toContain('crushing it')
  })

  it('auto-dismisses after 5 seconds', () => {
    expect(fileContent).toContain('5000')
  })

  it('uses warm teal background (not intense)', () => {
    expect(fileContent).toContain('teal-400')
    expect(fileContent).toContain('teal-600')
  })
})
