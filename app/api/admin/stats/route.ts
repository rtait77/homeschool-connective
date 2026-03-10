import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

export async function GET() {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
  )

  const now = new Date().toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: activeTrials },
    { count: activeSubscribers },
    { count: canceled },
    { count: recentSignups },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'trialing').gt('trial_end', now),
    admin.from('profiles').select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active'),
    admin.from('profiles').select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'canceled'),
    admin.from('profiles').select('*', { count: 'exact', head: true })
      .gt('created_at', sevenDaysAgo),
  ])

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    activeTrials: activeTrials ?? 0,
    activeSubscribers: activeSubscribers ?? 0,
    canceled: canceled ?? 0,
    recentSignups: recentSignups ?? 0,
  })
}
