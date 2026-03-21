import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
  )

  // Get consulting customer
  const { data: customer } = await admin
    .from('consulting_customers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!customer) return NextResponse.json({ error: 'No consulting record' }, { status: 404 })

  // Get report
  const { data: report } = await admin
    .from('reports')
    .select('id, custom_intro, status, sent_at')
    .eq('customer_id', customer.id)
    .maybeSingle()

  if (!report || report.status !== 'sent') {
    return NextResponse.json({ report: null })
  }

  // Get items with resource details
  const { data: items } = await admin
    .from('report_items')
    .select('id, reason, sort_order, for_people, resources(name, price_range, requires_screen, url, description, subjects, grade_levels)')
    .eq('report_id', report.id)
    .order('sort_order', { ascending: true })

  return NextResponse.json({ report, items: items ?? [] })
}
