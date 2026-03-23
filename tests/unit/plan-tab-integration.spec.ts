/**
 * Integration tests for PlanTab integration into the athlete page.
 *
 * Tests:
 * 1. athlete page no longer renders WorkingOnCard
 * 2. athlete page no longer renders goal progress above tabs
 * 3. Plan tab appears in tab bar between Runs and Cues
 * 4. Plan tab is visible to caregivers (read-only)
 * 5. EditAthleteForm no longer shows goal fields
 * 6. EditAthleteForm still shows medical notes and emergency contact
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const athletePagePath = join(__dirname, '..', '..', 'src', 'app', 'athletes', '[id]', 'page.tsx')
const athleteTabsPath = join(__dirname, '..', '..', 'src', 'components', 'athlete', 'AthleteTabs.tsx')
const editFormPath = join(__dirname, '..', '..', 'src', 'components', 'athlete', 'EditAthleteForm.tsx')

let athletePageSource: string
let athleteTabsSource: string
let editFormSource: string

beforeAll(() => {
  athletePageSource = readFileSync(athletePagePath, 'utf-8')
  athleteTabsSource = readFileSync(athleteTabsPath, 'utf-8')
  editFormSource = readFileSync(editFormPath, 'utf-8')
})

describe('PlanTab integration into athlete page', () => {
  // 1. athlete page no longer renders WorkingOnCard
  it('athlete page no longer renders WorkingOnCard', () => {
    // WorkingOnCard import should be removed
    expect(athletePageSource).not.toContain("import WorkingOnCard from")
    // WorkingOnCard component usage should be removed
    expect(athletePageSource).not.toContain('<WorkingOnCard')
    // The old "What is Wei working on right now?" pattern should be gone from the page
    expect(athletePageSource).not.toContain('Working On status')
  })

  // 2. athlete page no longer renders goal progress above tabs
  it('athlete page no longer renders goal progress above tabs', () => {
    // The teal gradient goal progress bar above the tab row should be gone
    expect(athletePageSource).not.toContain('{/* Goal progress */}')
    // The goalProgress block that was rendered above tabs is removed
    // (it used a bg-gradient-to-r from-teal-50 to-emerald-50 pattern)
    expect(athletePageSource).not.toContain('from-teal-50 to-emerald-50')
    // Running goal should no longer appear in the profile strip
    expect(athletePageSource).not.toMatch(/🎯\s*\{athlete\.running_goal\}/)
  })

  // 3. Plan tab appears in tab bar between Runs and Cues
  it('Plan tab appears in tab bar between Runs and Cues', () => {
    // Plan tab type is included
    expect(athleteTabsSource).toContain("'plan'")
    // Tab definition exists
    expect(athleteTabsSource).toContain("{ key: 'plan', label: 'Plan' }")
    // Plan appears after feed (Runs) and before cues in the tabs array
    const feedIndex = athleteTabsSource.indexOf("{ key: 'feed', label: 'Runs' }")
    const planIndex = athleteTabsSource.indexOf("{ key: 'plan', label: 'Plan' }")
    const cuesIndex = athleteTabsSource.indexOf("{ key: 'cues' as Tab, label: 'Cues' }")
    expect(feedIndex).toBeGreaterThan(-1)
    expect(planIndex).toBeGreaterThan(-1)
    expect(cuesIndex).toBeGreaterThan(-1)
    expect(planIndex).toBeGreaterThan(feedIndex)
    expect(planIndex).toBeLessThan(cuesIndex)
    // PlanTab component is dynamically imported
    expect(athleteTabsSource).toContain("const PlanTab = dynamic(() => import('./PlanTab'))")
    // PlanTab is rendered in the tab content
    expect(athleteTabsSource).toContain('<PlanTab')
  })

  // 4. Plan tab is visible to caregivers (read-only)
  it('Plan tab is visible to caregivers (read-only)', () => {
    // Plan tab is NOT conditionally hidden behind !isReadOnly
    // The plan tab definition should not be wrapped in an isReadOnly conditional
    const planTabLine = athleteTabsSource.match(/\{ key: 'plan', label: 'Plan' \}/)
    expect(planTabLine).not.toBeNull()
    // Ensure plan tab is a direct entry in the array (not spread with a conditional)
    // It should appear as a direct object in the array, not ...(!isReadOnly ? [...])
    const beforePlan = athleteTabsSource.substring(
      athleteTabsSource.indexOf("{ key: 'feed', label: 'Runs' }"),
      athleteTabsSource.indexOf("{ key: 'plan', label: 'Plan' }")
    )
    expect(beforePlan).not.toContain('isReadOnly')
    // PlanTab receives isReadOnly prop
    expect(athleteTabsSource).toContain('isReadOnly={isReadOnly}')
  })

  // 5. EditAthleteForm no longer shows goal fields
  it('EditAthleteForm no longer shows goal fields', () => {
    // "Running goal" label should be removed
    expect(editFormSource).not.toContain('Running goal')
    // "Goal type" dropdown should be removed
    expect(editFormSource).not.toContain('Goal type')
    expect(editFormSource).not.toContain('name="goal_type"')
    // "Target" input for goals should be removed
    expect(editFormSource).not.toContain('name="goal_target"')
    // "Track goal progress" section header should be removed
    expect(editFormSource).not.toContain('Track goal progress')
    // running_goal, goal_type, goal_target should not be in the AthleteProfile type
    expect(editFormSource).not.toContain('running_goal:')
    expect(editFormSource).not.toContain('goal_type:')
    expect(editFormSource).not.toContain('goal_target:')
  })

  // 6. EditAthleteForm still shows medical notes and emergency contact
  it('EditAthleteForm still shows medical notes and emergency contact', () => {
    // medical_notes field is still present
    expect(editFormSource).toContain('medical_notes')
    expect(editFormSource).toContain('name="medical_notes"')
    expect(editFormSource).toContain('Medical notes')
    // emergency_contact field is still present
    expect(editFormSource).toContain('emergency_contact')
    expect(editFormSource).toContain('name="emergency_contact"')
    expect(editFormSource).toContain('Emergency contact')
    // communication_notes field is still present
    expect(editFormSource).toContain('communication_notes')
    expect(editFormSource).toContain('name="communication_notes"')
    // PIN setup section is still present
    expect(editFormSource).toContain('AthletePinSection')
  })

  // Additional: athlete page fetches focus_areas and goal choice fields
  it('athlete page fetches focus_areas data', () => {
    expect(athletePageSource).toContain("from('focus_areas')")
    expect(athletePageSource).toContain('focusAreas')
    expect(athletePageSource).toContain('activeFocus')
    expect(athletePageSource).toContain('focusHistory')
  })

  it('athlete page fetches athlete goal choice fields', () => {
    expect(athletePageSource).toContain('athlete_goal_choice')
    expect(athletePageSource).toContain('goal_choice_updated_at')
    expect(athletePageSource).toContain('previous_goal_choice')
    expect(athletePageSource).toContain('previous_goal_choice_at')
  })

  it('athlete page passes plan props to AthleteTabs', () => {
    expect(athletePageSource).toContain('activeFocus={activeFocus}')
    expect(athletePageSource).toContain('focusHistory={focusHistory}')
    expect(athletePageSource).toContain('runningGoal={athlete.running_goal}')
    expect(athletePageSource).toContain('goalProgress={goalProgress}')
    expect(athletePageSource).toContain('athleteGoalChoice=')
  })
})
