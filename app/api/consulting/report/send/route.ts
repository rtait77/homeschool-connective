import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import nodemailer from 'nodemailer'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

const titanTransport = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 587,
  secure: false,
  auth: {
    user: 'consulting@homeschoolconnective.com',
    pass: process.env.TITAN_SMTP_PASSWORD,
  },
})

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

// POST /api/consulting/report/send — send report email to client
export async function POST(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { customer_id } = await req.json()
  if (!customer_id) return NextResponse.json({ error: 'customer_id required' }, { status: 400 })

  const admin = await getAdmin()

  // Get consulting customer (for user_id)
  const { data: customer } = await admin
    .from('consulting_customers')
    .select('id, user_id')
    .eq('id', customer_id)
    .single()

  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  // Get client email from auth
  const { data: authUser } = await admin.auth.admin.getUserById(customer.user_id)
  const clientEmail = authUser?.user?.email
  if (!clientEmail) return NextResponse.json({ error: 'Client email not found' }, { status: 404 })

  // Get report + items with resource details
  const { data: report } = await admin
    .from('reports')
    .select('id, custom_intro, status')
    .eq('customer_id', customer_id)
    .maybeSingle()

  if (!report) return NextResponse.json({ error: 'No report found' }, { status: 404 })

  const { data: items } = await admin
    .from('report_items')
    .select('id, reason, sort_order, for_people, resources(name, price_range, requires_screen, religious_pref, url, description)')
    .eq('report_id', report.id)
    .order('sort_order', { ascending: true })

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Report has no items' }, { status: 400 })
  }

  // Build HTML email
  const intro = report.custom_intro?.trim()
    ? `<p style="font-size:16px;line-height:1.7;color:#444;margin-bottom:24px;white-space:pre-line;">${report.custom_intro.replace(/\n/g, '<br>')}</p>`
    : `<p style="font-size:16px;line-height:1.7;color:#444;margin-bottom:24px;">Hi! I've put together your personalized curriculum recommendations based on your intake form. I hope these are a great fit for your family!</p>`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedItems = items as any[]
  const hasAssignments = typedItems.some(i => (i.for_people ?? []).length > 0)

  function buildItemHtml(item: typeof typedItems[0], idx: number) {
    const r = item.resources
    const isChristianLite = r?.religious_pref === 'christian_lite'
    const allPeople: string[] = item.for_people ?? []
    const tagHtml = allPeople.length > 1
      ? allPeople.map((p: string) => `<span style="font-size:11px;font-weight:700;padding:1px 9px;border-radius:999px;background:${p === 'Parent' ? '#fde8e0' : '#e0f4f8'};color:${p === 'Parent' ? '#c0522a' : '#1a7a8e'};margin-right:4px;">${p}</span>`).join('')
      : ''
    return `
      <div style="margin-bottom:16px;padding:20px;background:#fff;border-radius:12px;border:1px solid #e8e0d5;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="font-size:13px;font-weight:800;color:#55b6ca;min-width:24px;">#${idx + 1}</span>
          <div style="flex:1;">
            <p style="font-size:17px;font-weight:800;color:#1c1c1c;margin:0 0 4px;">${r?.name ?? 'Resource'}</p>
            ${tagHtml ? `<p style="margin:0 0 8px;">${tagHtml}</p>` : ''}
            ${isChristianLite ? '<p style="font-size:12px;color:#a09890;margin:0 0 8px;">Note: contains light faith references</p>' : ''}
            <p style="font-size:15px;line-height:1.6;color:#444;margin:0;">${item.reason}</p>
            ${r?.url ? `<a href="${r.url}" style="display:inline-block;margin-top:10px;font-size:13px;font-weight:700;color:#ed7c5a;text-decoration:none;">Learn more →</a>` : ''}
          </div>
        </div>
      </div>`
  }

  let itemsHtml: string
  if (hasAssignments) {
    const groups: Record<string, typeof typedItems> = {}
    const peopleOrder: string[] = []
    typedItems.forEach(item => {
      const primary: string = (item.for_people ?? [])[0] ?? 'General'
      if (!groups[primary]) { groups[primary] = []; peopleOrder.push(primary) }
      groups[primary].push(item)
    })
    peopleOrder.sort((a, b) => {
      if (a === 'General') return 1; if (b === 'General') return -1
      if (a === 'Parent') return 1; if (b === 'Parent') return -1
      return 0
    })
    let globalIdx = 0
    itemsHtml = peopleOrder.map(person => {
      const sectionTitle = person === 'Parent' ? 'Parent Resources' : person === 'General' ? 'General Recommendations' : `For ${person}`
      const color = person === 'Parent' ? '#ed7c5a' : '#55b6ca'
      const sectionItems = groups[person].map(item => buildItemHtml(item, ++globalIdx)).join('')
      return `<p style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:${color};margin:24px 0 12px 0;">${sectionTitle}</p>${sectionItems}`
    }).join('')
  } else {
    itemsHtml = `<h3 style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#ed7c5a;margin-bottom:16px;">My Top Picks for Your Family</h3>` +
      typedItems.map((item, idx) => buildItemHtml(item, idx + 1)).join('')
  }

  const html = `
    <div style="font-family:'Helvetica Neue',Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:32px 16px;background:#f5f1e9;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style="height:52px;" />
      </div>
      <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <h2 style="font-size:24px;font-weight:800;color:#1c1c1c;margin-bottom:8px;">Your Personalized Recommendations</h2>
        <p style="font-size:14px;color:#888;margin-bottom:24px;">From Mel at Homeschool Connective</p>
        ${intro}
        ${itemsHtml}
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e8e0d5;">
          <p style="font-size:14px;color:#888;line-height:1.6;">Questions about any of these? Just reply to this email — I'm happy to talk through them with you!</p>
          <p style="font-size:14px;color:#888;">— Mel</p>
          <p style="font-size:13px;color:#aaa;margin-top:4px;">consulting@homeschoolconnective.com</p>
        </div>
      </div>
      <p style="text-align:center;font-size:12px;color:#aaa;margin-top:24px;">Homeschool Connective · <a href="https://homeschoolconnective.com" style="color:#aaa;">homeschoolconnective.com</a></p>
    </div>
  `

  // Send via Titan SMTP
  try {
    await titanTransport.sendMail({
      from: '"Mel at Homeschool Connective" <consulting@homeschoolconnective.com>',
      to: clientEmail,
      bcc: 'consulting@homeschoolconnective.com',
      subject: 'Your Personalized Recommendations from Mel',
      html,
    })
  } catch (err) {
    console.error('Failed to send report email:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  // Mark report as sent
  await admin
    .from('reports')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', report.id)

  return NextResponse.json({ ok: true, sent_to: clientEmail })
}
