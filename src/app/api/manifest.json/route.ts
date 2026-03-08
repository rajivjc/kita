import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { adminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

const STATIC_MANIFEST = {
  id: '/',
  name: 'SOSG Running Club',
  short_name: 'SOSG Run',
  description: 'Running club hub for coaches and athletes — growing together',
  start_url: '/feed',
  scope: '/',
  display: 'standalone' as const,
  background_color: '#FBF9F7',
  theme_color: '#0D9488',
  orientation: 'portrait' as const,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

const PWA_TOKEN_EXPIRY_DAYS = 30

export async function GET(request: NextRequest) {
  // Try to read auth from cookies without modifying them
  let userId: string | null = null

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() { /* read-only — don't set cookies for manifest requests */ },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {
    // Auth check failed — serve static manifest
  }

  if (!userId) {
    return NextResponse.json(STATIC_MANIFEST, {
      headers: { 'Content-Type': 'application/manifest+json' },
    })
  }

  // Generate or refresh a PWA token for the user
  const pwaToken = randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + PWA_TOKEN_EXPIRY_DAYS)

  await adminClient
    .from('users')
    .update({
      pwa_token: pwaToken,
      pwa_token_expires_at: expiresAt.toISOString(),
    })
    .eq('id', userId)

  const manifest = {
    ...STATIC_MANIFEST,
    start_url: `/auth/pwa-launch?token=${pwaToken}`,
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      // Short cache to ensure fresh token on install, but avoid excessive DB writes
      'Cache-Control': 'private, max-age=300',
    },
  })
}
