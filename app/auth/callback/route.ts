import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check existing subscription — don't overwrite active/trialing status with a fresh trial
    const { data: existing } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    const updates: Record<string, unknown> = {}

    if (!existing?.subscription_status) {
      // New user with no profile yet — start their trial
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 7)
      updates.trial_end = trialEnd.toISOString()
      updates.subscription_status = 'trialing'
    }

    if (user.user_metadata?.first_name) {
      updates.first_name = user.user_metadata.first_name
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('profiles').update(updates).eq('id', user.id)
    }
  }

  return NextResponse.redirect(new URL('/auth/confirm', req.url))
}
