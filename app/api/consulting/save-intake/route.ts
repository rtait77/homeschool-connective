import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { responses } = await req.json()

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
  )

  // Get the consulting customer record
  const { data: customer } = await admin
    .from('consulting_customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!customer) return NextResponse.json({ error: 'No consulting record found' }, { status: 404 })

  // Upsert the intake response
  const { data: existing } = await admin
    .from('consulting_intake_responses')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (existing?.status === 'submitted') {
    return NextResponse.json({ error: 'Form already submitted' }, { status: 400 })
  }

  if (existing) {
    await admin
      .from('consulting_intake_responses')
      .update({ responses, last_saved_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await admin
      .from('consulting_intake_responses')
      .insert({ customer_id: customer.id, user_id: user.id, responses, status: 'draft', last_saved_at: new Date().toISOString() })
  }

  return NextResponse.json({ ok: true })
}
