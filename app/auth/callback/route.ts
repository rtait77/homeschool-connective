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
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)

    await supabase
      .from('profiles')
      .update({
        trial_end: trialEnd.toISOString(),
        subscription_status: 'trialing',
        first_name: user.user_metadata?.first_name ?? null,
      })
      .eq('id', user.id)
  }

  return NextResponse.redirect(new URL('/auth/confirm', req.url))
}
