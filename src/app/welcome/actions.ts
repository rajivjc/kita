'use server'

import { adminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type WelcomeFormState = {
  error?: string
  success?: string
  redirectTo?: string
}

export async function saveWelcomeName(
  _prev: WelcomeFormState,
  formData: FormData
): Promise<WelcomeFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Your session has expired. Please sign in again.' }

  const name = (formData.get('name') as string ?? '').trim()
  if (!name) return { error: 'Please enter your name' }

  const { error } = await adminClient
    .from('users')
    .update({ name })
    .eq('id', user.id)

  if (error) return { error: 'Could not save your name. Please try again.' }

  // Determine redirect path based on role
  const { data: userRow } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  let redirectTo = '/feed'
  if (userRow?.role === 'caregiver') {
    const { data: athlete } = await adminClient
      .from('athletes')
      .select('id')
      .eq('caregiver_user_id', user.id)
      .maybeSingle()

    if (athlete) {
      redirectTo = `/athletes/${athlete.id}`
    }
  }

  revalidatePath('/welcome')
  revalidatePath('/feed')
  revalidatePath('/account')
  return { success: 'Welcome aboard!', redirectTo }
}
