import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

async function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
  )
}

async function checkAdmin() {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  return user?.email === ADMIN_EMAIL ? user : null
}

// GET /api/consulting/report?customer_id=xxx — load report + items for a client
export async function GET(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const customer_id = req.nextUrl.searchParams.get('customer_id')
  if (!customer_id) return NextResponse.json({ error: 'customer_id required' }, { status: 400 })

  const admin = await getAdmin()

  const { data: report } = await admin
    .from('reports')
    .select('id, status, custom_intro, generated_at, sent_at')
    .eq('customer_id', customer_id)
    .maybeSingle()

  if (!report) return NextResponse.json({ report: null, items: [] })

  const { data: items } = await admin
    .from('report_items')
    .select('id, resource_id, reason, sort_order, for_people, resources(name, price_range, requires_screen)')
    .eq('report_id', report.id)
    .order('sort_order', { ascending: true })

  return NextResponse.json({ report, items: items ?? [] })
}

// POST /api/consulting/report — add item to report (creates report if needed)
export async function POST(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { customer_id, resource_id, name, reason, for_people } = await req.json()
  if (!customer_id || !resource_id) {
    return NextResponse.json({ error: 'customer_id and resource_id required' }, { status: 400 })
  }

  const admin = await getAdmin()

  // Get or create report for this customer
  let { data: report } = await admin
    .from('reports')
    .select('id')
    .eq('customer_id', customer_id)
    .maybeSingle()

  if (!report) {
    const { data: newReport, error } = await admin
      .from('reports')
      .insert({ customer_id, status: 'draft', generated_at: new Date().toISOString() })
      .select('id')
      .single()
    if (error || !newReport) {
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
    }
    report = newReport
  }

  // Check if item already in report
  const { data: existing } = await admin
    .from('report_items')
    .select('id')
    .eq('report_id', report.id)
    .eq('resource_id', resource_id)
    .maybeSingle()

  if (existing) return NextResponse.json({ item: existing, already_exists: true })

  // Get current max sort_order
  const { data: maxItem } = await admin
    .from('report_items')
    .select('sort_order')
    .eq('report_id', report.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sort_order = (maxItem?.sort_order ?? 0) + 1

  const { data: item, error } = await admin
    .from('report_items')
    .insert({ report_id: report.id, resource_id, reason: reason ?? name ?? '', sort_order, for_people: for_people ?? [] })
    .select('id, resource_id, reason, sort_order, for_people')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ item, report_id: report.id })
}

// PATCH /api/consulting/report — update item reason or report custom_intro
export async function PATCH(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { item_id, reason, for_people, report_id, custom_intro } = await req.json()
  const admin = await getAdmin()

  if (item_id) {
    const updates: Record<string, unknown> = {}
    if (reason !== undefined) updates.reason = reason
    if (for_people !== undefined) updates.for_people = for_people
    if (Object.keys(updates).length > 0) {
      await admin.from('report_items').update(updates).eq('id', item_id)
    }
    return NextResponse.json({ ok: true })
  }

  if (report_id && custom_intro !== undefined) {
    await admin.from('reports').update({ custom_intro }).eq('id', report_id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'item_id+reason or report_id+custom_intro required' }, { status: 400 })
}

// DELETE /api/consulting/report?item_id=xxx — remove item from report
export async function DELETE(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const item_id = req.nextUrl.searchParams.get('item_id')
  if (!item_id) return NextResponse.json({ error: 'item_id required' }, { status: 400 })

  const admin = await getAdmin()
  await admin.from('report_items').delete().eq('id', item_id)

  return NextResponse.json({ ok: true })
}
