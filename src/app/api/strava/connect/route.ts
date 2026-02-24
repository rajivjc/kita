import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStravaAuthUrl } from '@/lib/strava/client'

export async function GET(request: NextRequest): Promise<Response> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const authUrl = getStravaAuthUrl(user.id)

  // Mobile browsers: return an HTML page that does a JavaScript redirect.
  // JS-initiated navigations do NOT trigger iOS Universal Links or Android
  // App Links, so the Strava app won't intercept — the OAuth flow stays
  // entirely in the current browser tab.
  const ua = request.headers.get('user-agent') ?? ''
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua)

  if (isMobile) {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Connecting to Strava…</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#FBF9F7;color:#111827}
.c{text-align:center}.s{width:24px;height:24px;border:3px solid #e5e7eb;border-top-color:#0D9488;border-radius:50%;animation:spin .6s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}</style></head>
<body><div class="c"><div class="s"></div><p>Connecting to Strava…</p></div>
<script>window.location.replace(${JSON.stringify(authUrl)});</script>
</body></html>`

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Desktop: standard 302 redirect (no Strava app to intercept)
  return NextResponse.redirect(authUrl)
}
