/**
 * Demo Seed Script — SOSG Running Club Hub
 *
 * Clears all data except the admin user (rajivjacob@gmail.com),
 * then inserts realistic demo data for recording a beta-testing video.
 *
 * Usage:
 *   npx ts-node --project scripts/tsconfig.json scripts/seed-demo.ts
 *
 * Requires .env.local (or exported env vars) with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load env from .env.local (Next.js convention)
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ADMIN_EMAIL = 'rajivjacob@gmail.com'

// ── Helpers ─────────────────────────────────────────────────────────

/** Sunday dates for club sessions (Asia/Singapore). Goes backwards from today. */
function sundaysInRange(from: string, to: string): string[] {
  const dates: string[] = []
  const start = new Date(from + 'T07:30:00+08:00')
  const end = new Date(to + 'T07:30:00+08:00')
  const d = new Date(start)
  // Advance to first Sunday
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1)
  while (d <= end) {
    dates.push(d.toISOString())
    d.setDate(d.getDate() + 7)
  }
  return dates
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 1000) / 1000
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ── Data Definitions ────────────────────────────────────────────────

interface AthleteProfile {
  name: string
  date_of_birth: string
  joined_at: string
  running_goal: string
  goal_type: 'distance_total' | 'distance_single' | 'session_count'
  goal_target: number
  communication_notes: string
  medical_notes: string
  emergency_contact: string
  hasCaregiver: boolean
  // Session generation params
  sessionStartDate: string
  avgDistanceKm: number
  distanceSpread: number
  avgFeelStart: number // feel improves over time
  notes: string[]
  cues: {
    helps: string[]
    avoid: string[]
    best_cues: string[]
    kit: string[]
  }
}

const ATHLETES: AthleteProfile[] = [
  {
    name: 'Wei Jie Tan',
    date_of_birth: '2005-08-12',
    joined_at: '2025-09-01',
    running_goal: 'Run 50 km by end of 2026',
    goal_type: 'distance_total',
    goal_target: 50,
    communication_notes: 'Responds well to visual cues and countdown timers. Prefers calm, clear instructions.',
    medical_notes: 'Autism spectrum. Uses noise-cancelling earbuds. No medication on session days.',
    emergency_contact: 'Tan Ah Kow (father) — 9123 4567',
    hasCaregiver: false,
    sessionStartDate: '2025-10-05',
    avgDistanceKm: 3.2,
    distanceSpread: 0.8,
    avgFeelStart: 3,
    notes: [
      'Great pacing today, kept a steady rhythm for the full 3K',
      'Started strong but slowed after 2K — might need a walk break strategy',
      'Wei Jie asked to keep going when I suggested stopping — amazing motivation!',
      'Tried the new route past the pond, he really enjoyed the scenery',
      'Personal best distance today! Very proud moment',
      'Used the 4-count breathing technique, helped settle nerves at the start',
    ],
    cues: {
      helps: ['Music during warm-up', 'Visual countdown timer', 'Same route each week', 'Quiet warm-up area'],
      avoid: ['Sudden loud noises', 'Crowded start lines', 'Changes to routine without warning'],
      best_cues: ['Look ahead, not down', 'Arms like a train', 'Breathe in 2, out 2'],
      kit: ['Noise-cancelling earbuds', 'Blue compression shirt', 'Cushioned Asics'],
    },
  },
  {
    name: 'Sarah Chen',
    date_of_birth: '2007-03-22',
    joined_at: '2025-10-01',
    running_goal: 'Complete a 5K run',
    goal_type: 'distance_single',
    goal_target: 5,
    communication_notes: 'Very social — loves chatting with coaches. Uses simple sentences. Thumbs up/down for quick checks.',
    medical_notes: 'Down syndrome. Flat feet — wears orthotics. Carry water at all times.',
    emergency_contact: 'Linda Chen (mother) — 8234 5678',
    hasCaregiver: false,
    sessionStartDate: '2025-10-12',
    avgDistanceKm: 2.5,
    distanceSpread: 0.6,
    avgFeelStart: 3,
    notes: [
      'Sarah was so happy today — high-fived everyone at the finish',
      'Walked the last 500m but didn\'t want to stop. Progress!',
      'Tried intervals: 2 min run, 1 min walk. She loved the structure',
      'Sarah brought her own water bottle today — very independent!',
      'Mentioned she wants to run with her school friends someday',
    ],
    cues: {
      helps: ['Buddy system with another athlete', 'Verbal encouragement every 500m', 'Stickers as rewards'],
      avoid: ['Running alone', 'Skipping warm-up stretches'],
      best_cues: ['Big steps, strong legs!', 'You\'re a superstar!', 'Swing those arms'],
      kit: ['Custom orthotics', 'Pink headband', 'Water bottle holster'],
    },
  },
  {
    name: 'Arun Kumar',
    date_of_birth: '2008-11-05',
    joined_at: '2025-12-01',
    running_goal: 'Build up to running 10 sessions',
    goal_type: 'session_count',
    goal_target: 10,
    communication_notes: 'Non-verbal. Uses picture cards and gestures. Watch for hand-flapping when excited or overwhelmed.',
    medical_notes: 'Autism spectrum (non-verbal). Sensory sensitivities — avoid tags on clothing. EpiPen in bag (bee sting allergy).',
    emergency_contact: 'Priya Kumar (mother) — 9876 5432',
    hasCaregiver: false,
    sessionStartDate: '2025-12-07',
    avgDistanceKm: 1.8,
    distanceSpread: 0.4,
    avgFeelStart: 2,
    notes: [
      'First session! Arun was cautious at first but warmed up after the warm-up jog',
      'Used picture cards to choose between two routes — picked the park trail',
      'Arun smiled at the 1K mark today — first time showing enjoyment during a run',
      'Shorter distance but he ran the whole way without stopping!',
    ],
    cues: {
      helps: ['Picture cards for route choices', 'Consistent coach pairing', 'Quiet start area away from crowd'],
      avoid: ['Clothing tags', 'Strong perfumes nearby', 'Sudden transitions'],
      best_cues: ['Show "go" card then start', 'Gentle tap on shoulder for pace', 'Thumbs up at each marker'],
      kit: ['Tag-free shirt', 'EpiPen in waist bag', 'Soft-sole Brooks'],
    },
  },
  {
    name: 'Mei Lin Ong',
    date_of_birth: '2006-06-18',
    joined_at: '2025-10-15',
    running_goal: 'Run 30 sessions total',
    goal_type: 'session_count',
    goal_target: 30,
    communication_notes: 'Speaks clearly but needs extra processing time. Wait 5 seconds before repeating. Loves praise.',
    medical_notes: 'Intellectual disability. Takes medication at 7am — confirm with mum before early sessions.',
    emergency_contact: 'Ong Mei Hua (mother) — 8765 4321',
    hasCaregiver: false,
    sessionStartDate: '2025-10-19',
    avgDistanceKm: 2.8,
    distanceSpread: 0.5,
    avgFeelStart: 4,
    notes: [
      'Mei Lin had the biggest smile at the finish line today',
      'She asked if she could help warm up the newer athletes — beautiful leadership moment',
      'Pacing was much more consistent this week compared to last month',
      'Mei Lin set a goal to run 3K next week — wrote it on her hand so she\'d remember',
      'Rain session today but she didn\'t mind at all — "I love rain running!" she said',
    ],
    cues: {
      helps: ['Verbal praise after each segment', '5-second processing pause', 'Running with a buddy'],
      avoid: ['Rushing instructions', 'Comparing to other athletes'],
      best_cues: ['Steady and strong!', 'One more lap, you\'ve got this', 'Chest up, eyes forward'],
      kit: ['Yellow running cap', 'Garmin watch (for distance display)', 'Light Nikes'],
    },
  },
  {
    name: 'Danish Rizal',
    date_of_birth: '2009-01-30',
    joined_at: '2026-02-01',
    running_goal: 'Complete first 3K',
    goal_type: 'distance_single',
    goal_target: 3,
    communication_notes: 'Shy at first but opens up quickly. Loves dinosaurs — use as conversation starter. Speaks Malay and English.',
    medical_notes: 'ADHD. Takes Ritalin (morning dose). May be restless during warm-up — redirect with movement.',
    emergency_contact: 'Rizal bin Ahmad (father) — 9234 8765',
    hasCaregiver: false,
    sessionStartDate: '2026-02-02',
    avgDistanceKm: 1.5,
    distanceSpread: 0.3,
    avgFeelStart: 3,
    notes: [
      'First session! Danish was nervous but his dad stayed nearby. Completed a full 1.5K!',
      'Much more relaxed today. Ran with Sarah and they chatted the whole way',
    ],
    cues: {
      helps: ['Movement-based warm-up (no standing still)', 'Dinosaur stickers as markers', 'Short clear instructions'],
      avoid: ['Long waiting periods', 'Standing in line'],
      best_cues: ['Run like a T-Rex!', 'Fast feet, strong legs', 'Almost at the dinosaur marker!'],
      kit: ['Dinosaur water bottle', 'Light trainers', 'Cap for sun'],
    },
  },
  {
    name: 'Rachel Lim',
    date_of_birth: '2006-09-07',
    joined_at: '2025-11-01',
    running_goal: 'Run 40 km total',
    goal_type: 'distance_total',
    goal_target: 40,
    communication_notes: 'Good verbal skills. Tends to get anxious before sessions — reassurance helps. Has a comfort routine (stretching her fingers).',
    medical_notes: 'Cerebral palsy (mild, right side). Uses ankle brace. Fatigue sets in after ~20 min — watch for limping.',
    emergency_contact: 'Jennifer Lim (mother) — 9345 6789',
    hasCaregiver: true,
    sessionStartDate: '2025-11-02',
    avgDistanceKm: 2.2,
    distanceSpread: 0.5,
    avgFeelStart: 3,
    notes: [
      'Rachel was worried about the rain but ended up loving it — breakthrough session',
      'Her ankle brace was rubbing — adjusted with tape and she finished strong',
      'Rachel ran her longest distance ever today! She couldn\'t stop smiling',
      'Good session. She asked to try running without the comfort stretch before starting — big step',
      'Shorter run today as she mentioned feeling tired. Listened to her body — great self-awareness',
    ],
    cues: {
      helps: ['Pre-run reassurance routine', 'Warm-up stretches (especially right calf)', 'Familiar coaches'],
      avoid: ['Uneven terrain', 'Running more than 25 min without break', 'Pressure to match others\' pace'],
      best_cues: ['Relax your shoulders', 'Short steps on this bit', 'You\'re doing amazing, Rach'],
      kit: ['Right ankle brace', 'Medical tape (backup)', 'Cushioned New Balance'],
    },
  },
]

const CAREGIVER_CHEERS = [
  'Go Rachel! Mummy is so proud of you! You can do it!',
  'We believe in you Rachel! Run strong today!',
  'Rachel you are our superstar! Have the best run today!',
  'Love you so much Rach! Remember to have fun!',
]

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('🏃 SOSG Demo Seed Script')
  console.log('========================\n')

  // 1. Look up admin user
  console.log('1. Looking up admin user...')
  const { data: adminUser, error: adminErr } = await admin
    .from('users')
    .select('*')
    .eq('email', ADMIN_EMAIL)
    .single()

  if (adminErr || !adminUser) {
    console.error(`Admin user ${ADMIN_EMAIL} not found:`, adminErr?.message)
    process.exit(1)
  }
  console.log(`   Found: ${adminUser.name ?? adminUser.email} (${adminUser.id})\n`)

  // 2. Clean up all data (respecting FK order)
  console.log('2. Cleaning up existing data...')
  const tablesToClear = [
    'kudos',
    'cheers',
    'coach_badges',
    'session_rsvp',
    'notifications',
    'media',
    'strava_sync_log',
    'strava_unmatched',
    'milestones',
    'coach_notes',
    'cues',
    'sessions',
    'invitations',
    'strava_connections',
    'athletes',
  ] as const

  for (const table of tablesToClear) {
    const { error } = await admin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      // Some tables use user_id as PK (strava_connections)
      const { error: err2 } = await admin.from(table).delete().neq('user_id', '00000000-0000-0000-0000-000000000000')
      if (err2) console.warn(`   Warning on ${table}:`, err2.message)
      else console.log(`   Cleared ${table}`)
    } else {
      console.log(`   Cleared ${table}`)
    }
  }

  // Delete non-admin users from public.users
  const { data: otherUsers } = await admin
    .from('users')
    .select('id')
    .neq('email', ADMIN_EMAIL)

  if (otherUsers && otherUsers.length > 0) {
    for (const u of otherUsers) {
      await admin.from('users').delete().eq('id', u.id)
      // Also delete from auth.users
      await admin.auth.admin.deleteUser(u.id)
    }
    console.log(`   Removed ${otherUsers.length} non-admin user(s)`)
  }

  // Ensure milestone_definitions exist (from seed.sql)
  const { data: existingDefs } = await admin.from('milestone_definitions').select('id')
  if (!existingDefs || existingDefs.length === 0) {
    console.log('\n   Re-seeding milestone definitions...')
    await admin.from('milestone_definitions').insert([
      { label: 'First Session', type: 'automatic', condition: { metric: 'session_count', threshold: 1 }, icon: '🏃', display_order: 1 },
      { label: '5 Sessions', type: 'automatic', condition: { metric: 'session_count', threshold: 5 }, icon: '⭐', display_order: 2 },
      { label: '10 Sessions', type: 'automatic', condition: { metric: 'session_count', threshold: 10 }, icon: '🔥', display_order: 3 },
      { label: '25 Sessions', type: 'automatic', condition: { metric: 'session_count', threshold: 25 }, icon: '💪', display_order: 4 },
      { label: '50 Sessions', type: 'automatic', condition: { metric: 'session_count', threshold: 50 }, icon: '🏅', display_order: 5 },
      { label: 'First 3K', type: 'automatic', condition: { metric: 'distance_km', threshold: 3 }, icon: '📍', display_order: 6 },
      { label: 'First 5K', type: 'automatic', condition: { metric: 'distance_km', threshold: 5 }, icon: '🎯', display_order: 7 },
      { label: 'First 10K', type: 'automatic', condition: { metric: 'distance_km', threshold: 10 }, icon: '🏆', display_order: 8 },
      { label: 'Personal Best', type: 'manual', condition: null, icon: '⚡', display_order: 9 },
      { label: 'Great Attitude', type: 'manual', condition: null, icon: '❤️', display_order: 10 },
    ])
  }

  // Fetch milestone definitions for later
  const { data: milestoneDefs } = await admin
    .from('milestone_definitions')
    .select('*')
    .order('display_order')
  const defMap = new Map((milestoneDefs ?? []).map((d: any) => [d.label, d]))

  console.log('')

  // 3. Create demo coach user
  console.log('3. Creating demo users...')

  const { data: coachAuth } = await admin.auth.admin.createUser({
    email: 'priya.coach@sosg.club',
    email_confirm: true,
    user_metadata: { name: 'Priya Nair', role: 'coach' },
  })
  let coachUserId: string | null = null
  if (coachAuth?.user) {
    coachUserId = coachAuth.user.id
    // The handle_new_user trigger should create the public.users row,
    // but we ensure it exists with the right data
    const { data: existingCoach } = await admin.from('users').select('id').eq('id', coachUserId).single()
    if (!existingCoach) {
      await admin.from('users').insert({
        id: coachUserId,
        email: 'priya.coach@sosg.club',
        name: 'Priya Nair',
        role: 'coach',
        active: true,
      })
    }
    console.log(`   Created coach: Priya Nair (${coachUserId})`)
  }

  // Create demo caregiver user
  const { data: caregiverAuth } = await admin.auth.admin.createUser({
    email: 'jennifer.lim@sosg.club',
    email_confirm: true,
    user_metadata: { name: 'Jennifer Lim', role: 'caregiver' },
  })
  let caregiverUserId: string | null = null
  if (caregiverAuth?.user) {
    caregiverUserId = caregiverAuth.user.id
    const { data: existingCg } = await admin.from('users').select('id').eq('id', caregiverUserId).single()
    if (!existingCg) {
      await admin.from('users').insert({
        id: caregiverUserId,
        email: 'jennifer.lim@sosg.club',
        name: 'Jennifer Lim',
        role: 'caregiver',
        active: true,
      })
    }
    console.log(`   Created caregiver: Jennifer Lim (${caregiverUserId})`)
  }

  const coaches = [adminUser.id, coachUserId].filter(Boolean) as string[]
  console.log('')

  // 4. Create athletes
  console.log('4. Creating athletes...')
  const athleteIds: Map<string, string> = new Map()

  for (const a of ATHLETES) {
    const insertData: any = {
      name: a.name,
      date_of_birth: a.date_of_birth,
      joined_at: a.joined_at,
      running_goal: a.running_goal,
      goal_type: a.goal_type,
      goal_target: a.goal_target,
      communication_notes: a.communication_notes,
      medical_notes: a.medical_notes,
      emergency_contact: a.emergency_contact,
      active: true,
    }
    if (a.hasCaregiver && caregiverUserId) {
      insertData.caregiver_user_id = caregiverUserId
    }

    const { data, error } = await admin.from('athletes').insert(insertData).select('id').single()
    if (error) {
      console.error(`   Error creating ${a.name}:`, error.message)
      continue
    }
    athleteIds.set(a.name, data.id)
    console.log(`   ${a.name} → ${data.id}`)
  }

  console.log('')

  // 5. Create sessions with realistic progression
  console.log('5. Creating sessions...')
  let totalSessions = 0
  const sessionsByAthlete: Map<string, { id: string; date: string; distance_km: number }[]> = new Map()

  for (const a of ATHLETES) {
    const athleteId = athleteIds.get(a.name)
    if (!athleteId) continue

    const sundays = sundaysInRange(a.sessionStartDate, '2026-02-23')
    const sessions: any[] = []
    const createdSessions: { id: string; date: string; distance_km: number }[] = []

    for (let i = 0; i < sundays.length; i++) {
      // Occasional missed sessions (10% chance, except first session)
      if (i > 0 && Math.random() < 0.1) continue

      // Distance improves slightly over time
      const progressBonus = i * 0.05
      const distance = Math.max(0.5, rand(
        a.avgDistanceKm - a.distanceSpread + progressBonus,
        a.avgDistanceKm + a.distanceSpread + progressBonus
      ))

      // Feel generally improves over time (with some variation)
      const feelBase = Math.min(5, a.avgFeelStart + (i * 0.15))
      const feel = Math.max(1, Math.min(5, Math.round(feelBase + rand(-1, 1)))) as 1 | 2 | 3 | 4 | 5

      // Duration based on ~7-9 min/km pace
      const paceMinPerKm = rand(7, 9)
      const durationSeconds = Math.round(distance * paceMinPerKm * 60)

      // Pick a coach (mostly admin, sometimes Priya)
      const coachId = (coachUserId && Math.random() < 0.35) ? coachUserId : adminUser.id

      // Add a note to ~40% of sessions
      const note = (Math.random() < 0.4 && a.notes.length > 0)
        ? a.notes[Math.min(Math.floor(i * a.notes.length / sundays.length), a.notes.length - 1)]
        : null

      sessions.push({
        athlete_id: athleteId,
        coach_user_id: coachId,
        status: 'completed',
        date: sundays[i],
        distance_km: distance,
        duration_seconds: durationSeconds,
        feel,
        note,
        sync_source: 'manual',
      })
    }

    if (sessions.length > 0) {
      const { data, error } = await admin.from('sessions').insert(sessions).select('id, date, distance_km')
      if (error) {
        console.error(`   Error inserting sessions for ${a.name}:`, error.message)
      } else {
        totalSessions += data.length
        sessionsByAthlete.set(a.name, data)
        console.log(`   ${a.name}: ${data.length} sessions`)
      }
    }
  }

  console.log(`   Total: ${totalSessions} sessions\n`)

  // 6. Create cues
  console.log('6. Creating coaching cues...')
  for (const a of ATHLETES) {
    const athleteId = athleteIds.get(a.name)
    if (!athleteId) continue

    const { error } = await admin.from('cues').insert({
      athlete_id: athleteId,
      helps: a.cues.helps,
      avoid: a.cues.avoid,
      best_cues: a.cues.best_cues,
      kit: a.cues.kit,
      version: 1,
      updated_by: adminUser.id,
    })
    if (error) console.error(`   Error for ${a.name}:`, error.message)
    else console.log(`   ${a.name}: ✓`)
  }
  console.log('')

  // 7. Create milestones
  console.log('7. Awarding milestones...')

  const milestoneMap: Record<string, string[]> = {
    'Wei Jie Tan': ['First Session', '5 Sessions', '10 Sessions', 'First 3K', 'First 5K', 'Great Attitude'],
    'Sarah Chen': ['First Session', '5 Sessions', 'First 3K'],
    'Arun Kumar': ['First Session'],
    'Mei Lin Ong': ['First Session', '5 Sessions', 'First 3K'],
    'Danish Rizal': ['First Session'],
    'Rachel Lim': ['First Session', '5 Sessions', 'First 3K', 'Personal Best'],
  }

  for (const [name, milestones] of Object.entries(milestoneMap)) {
    const athleteId = athleteIds.get(name)
    const athleteSessions = sessionsByAthlete.get(name)
    if (!athleteId || !athleteSessions) continue

    for (const label of milestones) {
      const def = defMap.get(label)
      if (!def) continue

      // Pick an appropriate session for the milestone
      let sessionIndex = 0
      if (label.includes('5 Sessions')) sessionIndex = Math.min(4, athleteSessions.length - 1)
      else if (label.includes('10 Sessions')) sessionIndex = Math.min(9, athleteSessions.length - 1)
      else if (label === 'First 3K') {
        // Find first session where distance >= 3
        const idx = athleteSessions.findIndex((s: any) => s.distance_km >= 3)
        sessionIndex = idx >= 0 ? idx : Math.min(3, athleteSessions.length - 1)
      } else if (label === 'First 5K') {
        const idx = athleteSessions.findIndex((s: any) => s.distance_km >= 5)
        sessionIndex = idx >= 0 ? idx : Math.min(8, athleteSessions.length - 1)
      } else if (label === 'Personal Best' || label === 'Great Attitude') {
        sessionIndex = Math.max(0, athleteSessions.length - 2)
      }

      const session = athleteSessions[sessionIndex]

      const { error } = await admin.from('milestones').insert({
        athlete_id: athleteId,
        milestone_definition_id: def.id,
        label,
        achieved_at: session?.date ?? new Date().toISOString(),
        awarded_by: adminUser.id,
        session_id: session?.id ?? null,
      })
      if (error) console.error(`   Error: ${name} - ${label}:`, error.message)
    }
    console.log(`   ${name}: ${milestones.join(', ')}`)
  }
  console.log('')

  // 8. Create coach notes
  console.log('8. Creating coach notes...')
  const coachNotes = [
    { athleteName: 'Wei Jie Tan', content: 'Wei Jie has made incredible progress since October. His pacing has become much more consistent and he\'s starting to self-regulate when to walk and when to run. The visual timer has been a game changer.', note_type: 'observation' as const, visibility: 'all' as const },
    { athleteName: 'Wei Jie Tan', content: 'Noticed he gets anxious when there are more than 10 people at the start. Let\'s try warming up at the quieter end of the park next week.', note_type: 'observation' as const, visibility: 'coaches_only' as const },
    { athleteName: 'Sarah Chen', content: 'Sarah is our social butterfly. She motivates everyone around her. Today she cheered for Arun at the finish line — what a team player.', note_type: 'general' as const, visibility: 'all' as const },
    { athleteName: 'Sarah Chen', content: 'Orthotics seem to be wearing down. Flagged to mum — she\'ll get new ones fitted next week.', note_type: 'observation' as const, visibility: 'coaches_only' as const },
    { athleteName: 'Arun Kumar', content: 'Arun is still warming up to the group but his comfort level is increasing each week. The picture cards are working well for giving him autonomy in route choices.', note_type: 'observation' as const, visibility: 'all' as const },
    { athleteName: 'Mei Lin Ong', content: 'Mei Lin volunteered to help warm up the newer athletes today. She\'s becoming a natural leader. So proud of her growth both as a runner and as a person.', note_type: 'general' as const, visibility: 'all' as const },
    { athleteName: 'Mei Lin Ong', content: 'Her mum confirmed medication timing is consistent. No concerns for early sessions.', note_type: 'observation' as const, visibility: 'coaches_only' as const },
    { athleteName: 'Danish Rizal', content: 'Just two sessions in but Danish is already more confident. The dinosaur markers along the route keep him engaged and give him something to run toward.', note_type: 'general' as const, visibility: 'all' as const },
    { athleteName: 'Rachel Lim', content: 'Rachel overcame her pre-run anxiety today without needing the full comfort routine. Major breakthrough! She said she felt "brave".', note_type: 'observation' as const, visibility: 'all' as const },
    { athleteName: 'Rachel Lim', content: 'Watch her right ankle closely — she mentioned mild discomfort in the last 500m. The tape adjustment helped but we should keep monitoring.', note_type: 'observation' as const, visibility: 'coaches_only' as const },
    { athleteName: 'Rachel Lim', content: 'Jennifer (mum) sent a lovely message saying Rachel talks about running club all week. The cheers feature is making a real difference for this family.', note_type: 'general' as const, visibility: 'all' as const },
  ]

  for (let i = 0; i < coachNotes.length; i++) {
    const n = coachNotes[i]
    const athleteId = athleteIds.get(n.athleteName)
    if (!athleteId) continue

    // Spread notes over time
    const daysAgo = Math.floor((coachNotes.length - i) * 5)
    const created = new Date()
    created.setDate(created.getDate() - daysAgo)

    const { error } = await admin.from('coach_notes').insert({
      athlete_id: athleteId,
      coach_user_id: (i % 3 === 2 && coachUserId) ? coachUserId : adminUser.id,
      content: n.content,
      note_type: n.note_type,
      visibility: n.visibility,
      created_at: created.toISOString(),
    })
    if (error) console.error(`   Error:`, error.message)
  }
  console.log(`   Created ${coachNotes.length} notes\n`)

  // 9. Create cheers (from caregiver for Rachel)
  if (caregiverUserId) {
    console.log('9. Creating caregiver cheers...')
    const rachelId = athleteIds.get('Rachel Lim')
    if (rachelId) {
      for (let i = 0; i < CAREGIVER_CHEERS.length; i++) {
        const daysAgo = (CAREGIVER_CHEERS.length - i) * 7
        const created = new Date()
        created.setDate(created.getDate() - daysAgo)

        // Older cheers are viewed, newest is unviewed
        const viewed = i < CAREGIVER_CHEERS.length - 1
          ? new Date(created.getTime() + 3600000).toISOString()
          : null

        await admin.from('cheers').insert({
          athlete_id: rachelId,
          user_id: caregiverUserId,
          message: CAREGIVER_CHEERS[i],
          created_at: created.toISOString(),
          viewed_at: viewed,
        })
      }
      console.log(`   Created ${CAREGIVER_CHEERS.length} cheers for Rachel\n`)
    }
  } else {
    console.log('9. Skipping cheers (no caregiver user)\n')
  }

  // 10. Create coach badges for admin
  console.log('10. Awarding coach badges...')
  const badgesToAward = [
    'first_steps',
    'high_five',
    'double_digits',
    'team_player',
    'all_star_coach',
    'storyteller',
    'heart_reader',
  ]

  for (const badgeKey of badgesToAward) {
    const daysAgo = badgesToAward.indexOf(badgeKey) * 14
    const earned = new Date()
    earned.setDate(earned.getDate() - daysAgo)

    await admin.from('coach_badges').insert({
      user_id: adminUser.id,
      badge_key: badgeKey,
      earned_at: earned.toISOString(),
    })
  }

  // Also give Priya a few badges
  if (coachUserId) {
    for (const key of ['first_steps', 'high_five', 'team_player']) {
      await admin.from('coach_badges').insert({
        user_id: coachUserId,
        badge_key: key,
      })
    }
  }
  console.log(`   Admin: ${badgesToAward.length} badges`)
  console.log(`   Priya: 3 badges\n`)

  // 11. Add kudos to recent sessions
  console.log('11. Adding kudos to recent sessions...')
  let kudosCount = 0
  for (const [name, sessions] of sessionsByAthlete.entries()) {
    if (!sessions || sessions.length === 0) continue
    // Give kudos to the last 2-3 sessions per athlete
    const recentSessions = sessions.slice(-3)
    for (const s of recentSessions) {
      // Admin gives kudos to Priya's sessions and vice versa
      const kudosGiver = coachUserId && Math.random() < 0.5 ? coachUserId : adminUser.id
      const { error } = await admin.from('kudos').insert({
        session_id: s.id,
        user_id: kudosGiver,
      })
      if (!error) kudosCount++
    }
  }
  console.log(`   Added ${kudosCount} kudos\n`)

  // 12. Create a few notifications for admin
  console.log('12. Creating notifications...')
  const notifications = [
    {
      user_id: adminUser.id,
      type: 'milestone' as const,
      payload: { athlete_name: 'Danish Rizal', milestone: 'First Session', icon: '🏃' },
      read: false,
      channel: 'in_app' as const,
    },
    {
      user_id: adminUser.id,
      type: 'milestone' as const,
      payload: { athlete_name: 'Wei Jie Tan', milestone: 'First 5K', icon: '🎯' },
      read: true,
      channel: 'in_app' as const,
    },
    {
      user_id: adminUser.id,
      type: 'general' as const,
      payload: { message: 'Welcome to SOSG Running Club Hub! Start by logging your first session.' },
      read: true,
      channel: 'in_app' as const,
    },
  ]

  const { error: notifErr } = await admin.from('notifications').insert(notifications)
  if (notifErr) console.error('   Error:', notifErr.message)
  else console.log(`   Created ${notifications.length} notifications\n`)

  // Done!
  console.log('========================')
  console.log('✅ Demo data seeded successfully!')
  console.log('')
  console.log('Summary:')
  console.log(`   Athletes:     ${athleteIds.size}`)
  console.log(`   Sessions:     ${totalSessions}`)
  console.log(`   Milestones:   ${Object.values(milestoneMap).flat().length}`)
  console.log(`   Coach notes:  ${coachNotes.length}`)
  console.log(`   Cheers:       ${CAREGIVER_CHEERS.length}`)
  console.log(`   Badges:       ${badgesToAward.length + 3}`)
  console.log(`   Kudos:        ${kudosCount}`)
  console.log(`   Notifications:${notifications.length}`)
  console.log('')
  console.log('Users:')
  console.log(`   Admin:     ${ADMIN_EMAIL} (${adminUser.id})`)
  if (coachUserId) console.log(`   Coach:     priya.coach@sosg.club (${coachUserId})`)
  if (caregiverUserId) console.log(`   Caregiver: jennifer.lim@sosg.club (${caregiverUserId})`)
  console.log('')
  console.log('🎬 Ready to record your demo video!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
