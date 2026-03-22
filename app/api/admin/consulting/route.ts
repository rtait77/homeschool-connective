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
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
  )

  const { data: customers } = await admin
    .from('consulting_customers')
    .select('id, user_id, paid_at, ends_at, intake_completed, intake_submitted_at, created_at, style_profile')
    .order('created_at', { ascending: false })

  if (!customers || customers.length === 0) return NextResponse.json({ customers: [] })

  // Get emails for each user_id
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = new Map((authData?.users ?? []).map(u => [u.id, u.email ?? '']))

  // Get intake responses
  const customerIds = customers.map(c => c.id)
  const { data: responses } = await admin
    .from('consulting_intake_responses')
    .select('customer_id, responses, status, submitted_at')
    .in('customer_id', customerIds)

  const responseMap = new Map((responses ?? []).map(r => [r.customer_id, r]))

  const result = customers.map(c => ({
    id: c.id,
    email: emailMap.get(c.user_id) ?? '—',
    paid_at: c.paid_at,
    ends_at: c.ends_at,
    intake_completed: c.intake_completed,
    intake_submitted_at: c.intake_submitted_at,
    responses: responseMap.get(c.id)?.responses ?? null,
    intake_status: responseMap.get(c.id)?.status ?? 'not-started',
    style_profile: c.style_profile ?? null,
  }))

  return NextResponse.json({ customers: result })
}
