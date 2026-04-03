# Kita

Free, open-source running club management app for Special Olympics and inclusive running clubs.

[kitarun.com](https://kitarun.com)

## What is Kita?

Kita was built by the head coach of a Special Olympics running club in Singapore. It replaces the WhatsApp groups and spreadsheets that many clubs rely on with a purpose-built tool for coordinating coaches, caregivers, and athletes.

Coaches log runs (manually or via Strava sync), track athlete progress through milestones, record coaching cues, and celebrate achievements. Caregivers get read-only access to their linked athlete's journey — they can send cheers and view milestone celebrations. Athletes have their own PIN-protected personal page where they can check in with their mood, pick goals, choose an avatar, favourite their best runs, and message their coach.

The app follows research-backed inclusive design principles throughout: WCAG 2.2 AAA contrast targets, literal language only (no idioms or metaphors), sensory-safe celebrations, large touch targets, and icons paired with text on all navigation. These aren't add-ons — they're core to how every screen is built. See [CLAUDE.md](./CLAUDE.md#inclusive-design-principles) for the full design guidelines and their sources.

Kita is currently in closed beta.

> "Kita" means "we/us" in Malay and Indonesian — specifically the inclusive form that includes the listener.

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Supabase** (Postgres database, authentication, row-level security, storage)
- **Tailwind CSS v4**
- **Deployed on Vercel**
- **PWA** — installable on iOS and Android

## Getting Started

```bash
git clone https://github.com/rajivjc/runsosg.git
cd runsosg
npm install
cp .env.example .env.local
# Fill in your Supabase credentials and other values in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

## Contact

hello@kitarun.com
