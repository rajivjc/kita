# SOSG Running Club Hub — Product Review

*Honest, unbiased assessment from a product management perspective.*

---

## THE ELEVATOR PITCH

A mobile-first PWA for a running club serving athletes with special needs. Coaches log runs, track athlete progress, manage coaching cues, and celebrate milestones. Caregivers get a read-only window into their child's journey. Strava integration automates session capture.

---

## WHAT'S GENUINELY GOOD

### 1. The mission is compelling and the niche is underserved

This is not "yet another running app." It serves athletes with special needs — a community that is badly underserved by every mainstream fitness platform. Strava, Nike Run Club, Garmin Connect — none of them have the concept of a coach logging runs *on behalf of* an athlete, coaching cues, or a caregiver read-only view. The problem space is real and defensible.

### 2. Thoughtful role-based design

Three roles (admin, coach, caregiver) with genuinely different experiences. The caregiver view is not a dumbed-down version of the coach view — it's a purpose-built experience with cheer-sending, journey stories, milestone celebration, and read receipts. This shows empathy for the actual users.

### 3. The "feel" system is brilliant for this audience

The 5-level feel emoji system is a simple but powerful innovation. For athletes who may struggle with traditional RPE scales or verbal feedback, a coach selecting an emoji post-run creates longitudinal data that would otherwise be lost. The color-coded borders on session cards make feel trends scannable at a glance.

### 4. Milestone celebrations are emotionally impactful

Confetti overlays, shareable milestone pages with OG images, the journey story page — these aren't vanity features. For a parent of a special-needs athlete, getting a link that says "Your child just ran their 10th session" is genuinely moving. **This is the killer feature. It's the reason someone would tell another parent about this app.**

### 5. Solid technical foundation

- Server Components for data fetching, client components for interactivity — textbook Next.js App Router usage
- Parallel data fetching in `Promise.all` blocks (feed page fetches 9+ queries concurrently)
- RLS on all 15+ tables, auth verified in every server action
- Cookie hardening against mobile ITP (1-year expiry)
- Image compression client-side before upload
- Signed URLs for photos with proper expiry

### 6. PWA-first with real attention to mobile

Safe area insets, 44px touch targets, bottom nav, splash screen, install prompt — this app was clearly designed to be "installed" on a coach's phone and used trackside.

### 7. Coaching cues with version history

The 4-category cue system (Helps / Avoid / Best Cues / Kit) with undo and auto-save is exactly what a volunteer coach needs before a session. This is institutional knowledge that would otherwise live in someone's head.

---

## WHAT'S LACKING — THE HARD TRUTHS

### 1. There is no compelling reason to open this app daily

This is the #1 problem. The feed is informational but not actionable. A coach opens the app, sees a greeting card, some stats, and past sessions. There is no:

- **Upcoming schedule view** ("You're coaching Sarah at 4pm today")
- **Pre-session checklist** ("Here are Sarah's cues — review before you go")
- **Post-session prompt** ("You coached Sarah today — how did it go?")
- **Push notifications** (the notification system exists in-app only)

The app tracks what *happened* but doesn't help coaches prepare for what's *about to happen*. A world-class app would make the coach's day easier, not just log it.

### 2. The feed page is doing too much

The feed page is a single file making 18+ database queries across 3 phases. It handles both coach AND caregiver views, computes weekly recaps, streaks, kudos, and onboarding state, and renders the entire feed UI inline. This is a maintainability risk and a performance concern.

- 30 sessions hard-capped, no pagination
- No infinite scroll
- No date range filtering
- As the club grows past 10 athletes and 100+ sessions, this page will slow down and become noisy

### 3. No offline capability despite being a PWA

The service worker is registered, but there's no caching strategy. A coach at a park with spotty mobile data can't:

- View their athlete's cues
- Log a run that syncs later
- See the last session details

For a trackside tool, offline-first should be table stakes, not a nice-to-have.

### 4. Minimal test coverage

Despite test infrastructure being set up (Jest + Playwright), the core business logic — milestones, matching, feeds, auth flows — remains largely untested. For a data-sensitive app managing athlete information, this is a significant risk.

### 5. The Strava integration is fragile

The matching algorithm (`#sosg <name>` hashtag or schedule proximity) is clever but error-prone:

- Coaches must remember to add a hashtag to every Strava activity
- Schedule-based matching assumes predictable session times
- Unmatched activities require manual resolution through a notification flow
- There's no immediate feedback loop when matching fails

### 6. No data export or reporting

Coaches and admins have no way to:

- Export session logs as CSV/PDF
- Generate a progress report for a caregiver or school
- Print an athlete's milestone history
- Share aggregate club data with sponsors or funders

For a club that likely needs to report outcomes to stakeholders, this is a real gap.

### 7. No dark mode

The design tokens reference only light-mode values. Coaches using the app in evening or early morning sessions will notice.

### 8. The admin section is rudimentary

- No audit log (who invited whom, who changed what)
- No bulk operations (invite 10 caregivers at once, archive old athletes)
- No club analytics dashboard (growth over time, coach engagement)
- No configurable permissions (all coaches can see all athletes — no concept of "my athletes")

### 9. TypeScript is underutilized

Heavy use of `as any` casts throughout the codebase (30+ in the feed page alone). TypeScript is being used but its value is being bypassed, making refactoring risky and bugs harder to catch.

---

## WHY WOULD ANYONE WANT TO USE THIS APP?

**They would use it because nothing else exists for this use case.** That's both the honest answer and the strategic advantage.

A parent of a special needs runner has zero alternatives for:
- Seeing their child's running progress in a structured way
- Getting milestone celebrations they can share with family
- Sending encouragement to coaches
- Having a historical record of coaching cues and notes

A volunteer coach has zero alternatives for:
- Logging sessions on behalf of athletes who can't use Strava themselves
- Tracking what works and doesn't work for each athlete (cues)
- Celebrating incremental achievements that mainstream apps would ignore (first 1km run)

**The value proposition is not "this is a better running app." It's "this is the only running app that sees our community."**

---

## WHAT WOULD MAKE SOMEONE EXCITED TO USE THIS APP?

### 5 things that would transform this from "useful tool" to "app people love"

**1. Pre-session prep mode**

When a coach opens the app 30 minutes before a session, show them: "You're about to coach Sarah. Her last run was 1.2km and she felt great. Her cues: use counting cadence, avoid sudden stops. Goal: 1.5km today." One screen. Everything they need. *This* is the daily hook.

**2. Push notifications that matter**

"Sarah just hit her 10th session!" sent to the caregiver's phone is worth more than any feature on the feed page. Caregivers would open this app because it brings them *unexpected joy*. Right now, they have to open the app and check manually.

**3. A shareable athlete profile / journey page**

The `/story/[id]` page exists but it's behind auth patterns. Imagine a public, beautifully designed page a parent could share on social media: "My daughter has run 25km with SOSG this year!" with a timeline of milestones. This is organic growth fuel. Parents share pride. Make it effortless.

**4. Voice-to-log after sessions**

Coaches are busy at the track with multiple athletes. Let them tap one button and say "Sarah, 1.5 kilometers, felt great, she counted to 10 on her own today" and have the app parse it into a structured session. This would be a genuine 10x improvement over filling out a form.

**5. A "Year in Review" for each athlete**

Generate a beautiful annual summary: total distance, sessions, milestones, best moments, coach quotes. Something a parent would print and frame. Something that proves the program's value to donors. This is the kind of feature that makes people emotional and tell everyone about the app.

---

## BOTTOM LINE

**What's been built is genuinely impressive for a niche app.** The role-based design, feel system, milestone celebrations, and caregiver view show real product thinking. The technical execution is solid — proper auth, RLS, Strava integration, PWA setup.

**But it's currently a logging tool, not a coaching companion.** The gap between "good internal tool for a running club" and "app that coaches and parents love" comes down to:

1. **Anticipation over documentation** — help coaches prepare, not just record
2. **Emotional moments delivered proactively** — push milestone celebrations, don't wait for someone to open the app
3. **Shareability** — every milestone is a marketing moment; make sharing effortless and beautiful
4. **Offline-first** — this is a field tool, treat it like one
5. **Data storytelling** — the data is there, but it's not being turned into narratives that move people

The foundation is strong. The mission is real. The gap is in turning features into experiences.
