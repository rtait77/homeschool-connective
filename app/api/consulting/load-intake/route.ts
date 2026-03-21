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

  const { data: record } = await admin
    .from('consulting_intake_responses')
    .select('responses, status, last_saved_at')
    .eq('user_id', user.id)
    .single()

  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check if a report has already been sent to this user
  const { data: customer } = await admin
    .from('consulting_customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let reportSent = false
  if (customer) {
    const { data: report } = await admin
      .from('reports')
      .select('status')
      .eq('customer_id', customer.id)
      .eq('status', 'sent')
      .maybeSingle()
    reportSent = !!report
  }

  return NextResponse.json({
    responses: record.responses,
    status: record.status,
    last_saved_at: record.last_saved_at,
    report_sent: reportSent,
  })
}
