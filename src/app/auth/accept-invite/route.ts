import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const baseUrl = `${proto}://${host}`

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login`)
  }

  // Look up invitation by token
  const { data: invitation, error: lookupError } = await adminClient
    .from('invitations')
    .select('id, email, role, athlete_id, accepted_at, expires_at')
    .eq('token', token)
    .single()

  if (lookupError || !invitation) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid-invite`)
  }

  // Check if already accepted
  if (invitation.accepted_at) {
    return NextResponse.redirect(
      `${baseUrl}/login?email=${encodeURIComponent(invitation.email)}`
    )
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.redirect(
      `${baseUrl}/login?email=${encodeURIComponent(invitation.email)}&expired=true`
    )
  }

  // Generate a magic link server-side and verify it immediately to create a session
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: invitation.email,
    options: {
      redirectTo: `${baseUrl}/welcome`,
    },
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error('[accept-invite] Failed to generate magic link:', linkError)
    return NextResponse.redirect(
      `${baseUrl}/login?email=${encodeURIComponent(invitation.email)}`
    )
  }

  // Verify the OTP server-side to establish session cookies
  const supabase = await createClient()
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })

  if (verifyError) {
    console.error('[accept-invite] Failed to verify OTP:', verifyError)
    return NextResponse.redirect(
      `${baseUrl}/login?email=${encodeURIComponent(invitation.email)}`
    )
  }

  // Mark invitation as accepted
  await adminClient
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  // For caregivers, link them to their athlete
  if (invitation.role === 'caregiver' && invitation.athlete_id) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await adminClient
        .from('athletes')
        .update({ caregiver_user_id: user.id })
        .eq('id', invitation.athlete_id)
        .is('caregiver_user_id', null)
    }
  }

  return NextResponse.redirect(`${baseUrl}/welcome`)
}
