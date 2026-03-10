import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized', email: user?.email ?? 'none' }, { status: 401 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
    )

    const [authData, profilesData] = await Promise.all([
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from('profiles').select('id, trial_end, subscription_status, stripe_customer_id, created_at'),
    ])

    if (authData.error) {
      return NextResponse.json({ error: 'listUsers failed', detail: authData.error.message }, { status: 500 })
    }

    const authUsers = authData.data?.users ?? []
    const profileMap = new Map((profilesData.data ?? []).map(p => [p.id, p]))

    const users = authUsers.map(u => {
      const profile = profileMap.get(u.id)
      return {
        id: u.id,
        email: u.email ?? '',
        joined: u.created_at,
        subscription_status: profile?.subscription_status ?? 'unknown',
        trial_end: profile?.trial_end ?? null,
        stripe_customer_id: profile?.stripe_customer_id ?? null,
      }
    }).sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime())

    return NextResponse.json({ users })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: 'Server error', detail: msg }, { status: 500 })
  }
}
