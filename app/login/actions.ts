'use server'

import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

export async function loginAction(
  email: string,
  password: string
): Promise<{ error?: string; redirectTo?: string; access_token?: string; refresh_token?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  return {
    access_token: data.session!.access_token,
    refresh_token: data.session!.refresh_token,
    redirectTo: data.user?.email === ADMIN_EMAIL ? '/admin' : '/learn',
  }
}
