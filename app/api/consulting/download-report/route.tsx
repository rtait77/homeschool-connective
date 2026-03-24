import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import React from 'react'

const coral = '#ed7c5a'
const teal = '#55b6ca'
const dark = '#1c1c1c'
const muted = '#666666'
const cream = '#f5f1e9'
const white = '#ffffff'
const borderCol = '#e8e0d5'

const LEARNING_STYLE_DESCRIPTIONS: Record<string, string> = {
  Visual: 'Learns best through images, diagrams, maps, drawings, and videos.',
  Auditory: 'Learns best through sound — read-alouds, lectures, and discussion.',
  Kinesthetic: 'Learns best through movement and activity.',
  Tactile: 'Learns best through touch and hands-on exploration.',
}

const METHOD_DESCRIPTIONS: Record<string, string> = {
  Traditional: 'Structured approach with clear lesson plans and grade-level progression.',
  Classical: 'Built around the three stages of learning: grammar, logic, and rhetoric.',
  'Charlotte Mason': 'Built around living books, narration, nature study, and short focused lessons.',
  Montessori: 'Child-led and hands-on, with carefully prepared materials.',
  Waldorf: 'Emphasizes creativity, art, music, storytelling, and movement.',
  Unschooling: 'Child directs their own learning based on interests and passions.',
  Eclectic: 'Combines the best of multiple methods for a customized approach.',
  'Lifestyle Learning': 'Learning woven into everyday life through field trips and real-world projects.',
}

const TEACHING_STYLE_DESCRIPTIONS: Record<string, string> = {
  'Direct Teacher': 'You like to sit down and teach — explain, ask questions, stay actively involved.',
  'Facilitator': 'You prefer to set up materials, then step back and let your child explore.',
  'Read-aloud & Discussion': 'You love reading aloud together and talking about what you\'ve read.',
  'Experience-based': 'You teach through doing — field trips, documentaries, real-world projects.',
  'Resource-dependent': 'You let a curriculum, app, or video do the primary teaching while you guide.',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ReportDocument({ report, items, styleProfile, sentAt, Document, Page, Text, View, StyleSheet, Link }: { report: any, items: any[], styleProfile: any, sentAt: string, Document: any, Page: any, Text: any, View: any, StyleSheet: any, Link: any }) {
  const s = StyleSheet.create({
    page: { backgroundColor: cream, padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: dark },
    header: { alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: borderCol, borderBottomStyle: 'solid' },
    title: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: dark, marginBottom: 4 },
    subtitle: { fontSize: 10, color: muted },
    card: { backgroundColor: white, borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: borderCol, borderStyle: 'solid' },
    sectionLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: coral, marginBottom: 12 },
    subsectionLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: teal, marginBottom: 8 },
    divider: { borderTopWidth: 1, borderTopColor: borderCol, borderTopStyle: 'solid', marginTop: 12, marginBottom: 12 },
    styleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    badge: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: white, backgroundColor: coral, paddingTop: 2, paddingBottom: 2, paddingLeft: 8, paddingRight: 8, borderRadius: 999, marginRight: 10, marginTop: 2 },
    badgeTeal: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: white, backgroundColor: teal, paddingTop: 2, paddingBottom: 2, paddingLeft: 8, paddingRight: 8, borderRadius: 999, marginRight: 10, marginTop: 2 },
    styleItemName: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
    styleItemDesc: { fontSize: 9, color: muted, lineHeight: 1.5 },
    personLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: teal, marginBottom: 10, marginTop: 12 },
    itemCard: { backgroundColor: white, borderRadius: 8, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: borderCol, borderStyle: 'solid', flexDirection: 'row' },
    itemNumber: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: teal, width: 24 },
    itemContent: { flex: 1 },
    itemName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: dark, marginBottom: 4 },
    itemReason: { fontSize: 10, color: '#444444', lineHeight: 1.6, marginBottom: 6 },
    introText: { fontSize: 11, lineHeight: 1.7, color: dark },
    footer: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: borderCol, borderTopStyle: 'solid', alignItems: 'center' },
    footerText: { fontSize: 9, color: muted, textAlign: 'center', marginBottom: 4 },
  })

  const hasAssignments = items.some((i: any) => (i.for_people ?? []).length > 0)
  const groups: Record<string, any[]> = {}
  const peopleOrder: string[] = []
  items.forEach((item: any) => {
    const primary = (item.for_people ?? [])[0] ?? 'General'
    if (!groups[primary]) { groups[primary] = []; peopleOrder.push(primary) }
    groups[primary].push(item)
  })
  peopleOrder.sort((a, b) => {
    if (a === 'General') return 1; if (b === 'General') return -1
    if (a === 'Parent') return 1; if (b === 'Parent') return -1
    return 0
  })
  const sections = hasAssignments ? peopleOrder : ['General']
  const allItems = hasAssignments ? groups : { General: items }
  let globalIdx = 0

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.title}>Your Personalized Recommendations</Text>
          <Text style={s.subtitle}>
            From Mel at Homeschool Connective
            {sentAt ? ` · ${new Date(sentAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
          </Text>
        </View>
        {styleProfile && (styleProfile.learningStyles?.length > 0 || styleProfile.methods?.length > 0 || styleProfile.teachingStyle) && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>YOUR RESULTS AT A GLANCE</Text>
            {styleProfile.learningStyles?.length > 0 && (
              <View>
                <Text style={s.subsectionLabel}>HOW YOUR CHILD LEARNS BEST</Text>
                {styleProfile.learningStyles.map((style: string, i: number) => (
                  <View key={style} style={s.styleRow}>
                    <Text style={i === 0 ? s.badge : s.badgeTeal}>{i === 0 ? 'Primary' : i === 1 ? '2nd' : '3rd'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.styleItemName}>{style}</Text>
                      <Text style={s.styleItemDesc}>{LEARNING_STYLE_DESCRIPTIONS[style] ?? ''}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            {styleProfile.learningStyles?.length > 0 && styleProfile.methods?.length > 0 && <View style={s.divider} />}
            {styleProfile.methods?.length > 0 && (
              <View>
                <Text style={s.subsectionLabel}>BEST-FIT HOMESCHOOLING APPROACHES</Text>
                {styleProfile.methods.map((method: string, i: number) => (
                  <View key={method} style={s.styleRow}>
                    <Text style={i === 0 ? s.badge : s.badgeTeal}>{i === 0 ? 'Best fit' : i === 1 ? '2nd' : '3rd'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.styleItemName}>{method}</Text>
                      <Text style={s.styleItemDesc}>{METHOD_DESCRIPTIONS[method] ?? ''}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            {styleProfile.methods?.length > 0 && styleProfile.teachingStyle && <View style={s.divider} />}
            {styleProfile.teachingStyle && (
              <View>
                <Text style={s.subsectionLabel}>YOUR TEACHING STYLE</Text>
                <View style={s.styleRow}>
                  <Text style={s.badge}>Your style</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.styleItemName}>{styleProfile.teachingStyle}</Text>
                    <Text style={s.styleItemDesc}>{TEACHING_STYLE_DESCRIPTIONS[styleProfile.teachingStyle] ?? ''}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
        {report.custom_intro && (
          <View style={s.card}>
            <Text style={s.introText}>{report.custom_intro}</Text>
          </View>
        )}
        {sections.map(person => {
          const sectionTitle = person === 'Parent' ? 'PARENT/GUARDIAN RESOURCES' : person === 'General' ? 'MY TOP PICKS FOR YOUR FAMILY' : `FOR ${person.toUpperCase()}`
          const labelColor = person === 'Parent' ? coral : teal
          return (
            <View key={person}>
              <Text style={[s.personLabel, { color: labelColor }]}>{sectionTitle}</Text>
              {(allItems[person] ?? []).map((item: any) => {
                globalIdx++
                const r = item.resources
                return (
                  <View key={item.id} style={s.itemCard}>
                    <Text style={s.itemNumber}>#{globalIdx}</Text>
                    <View style={s.itemContent}>
                      <Text style={s.itemName}>{r?.name ?? 'Resource'}</Text>
                      <Text style={s.itemReason}>{item.reason}</Text>
                      {r?.url && (
                        <Link src={r.url} style={{ fontSize: 9, color: coral, fontFamily: 'Helvetica-Bold' }}>
                          Learn more →
                        </Link>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          )
        })}
        <View style={s.footer}>
          <Text style={s.footerText}>Questions? Reply to your report email — Mel is happy to help.</Text>
          <Text style={s.footerText}>consulting@homeschoolconnective.com</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function GET() {
  console.log('[download-report] Request started')

  try {
    // Step 1: Auth
    console.log('[download-report] Step 1: Authenticating user')
    const cookieStore = await cookies()
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError) {
      console.error('[download-report] Auth error:', authError.message)
      return NextResponse.json({ error: 'Auth error', detail: authError.message }, { status: 401 })
    }
    if (!user) {
      console.error('[download-report] No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('[download-report] Step 1 OK: user', user.id)

    // Step 2: Admin client
    console.log('[download-report] Step 2: Creating admin client')
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
    )

    // Step 3: Get customer
    console.log('[download-report] Step 3: Fetching consulting customer')
    const { data: customer, error: customerError } = await admin
      .from('consulting_customers')
      .select('id, style_profile')
      .eq('user_id', user.id)
      .maybeSingle()
    if (customerError) {
      console.error('[download-report] Customer fetch error:', customerError.message)
      return NextResponse.json({ error: 'DB error fetching customer', detail: customerError.message }, { status: 500 })
    }
    if (!customer) {
      console.error('[download-report] No consulting record for user', user.id)
      return NextResponse.json({ error: 'No consulting record' }, { status: 404 })
    }
    console.log('[download-report] Step 3 OK: customer', customer.id)

    // Step 4: Get report
    console.log('[download-report] Step 4: Fetching report')
    const { data: report, error: reportError } = await admin
      .from('reports')
      .select('id, custom_intro, status, sent_at')
      .eq('customer_id', customer.id)
      .maybeSingle()
    if (reportError) {
      console.error('[download-report] Report fetch error:', reportError.message)
      return NextResponse.json({ error: 'DB error fetching report', detail: reportError.message }, { status: 500 })
    }
    console.log('[download-report] Step 4 OK: report status =', report?.status, 'sent_at =', report?.sent_at)
    if (!report || report.status !== 'sent') {
      return NextResponse.json({ error: 'Report not ready', status: report?.status ?? 'no report' }, { status: 404 })
    }

    // Step 5: Get items
    console.log('[download-report] Step 5: Fetching report items')
    const { data: items, error: itemsError } = await admin
      .from('report_items')
      .select('id, reason, sort_order, for_people, resources(name, price_range, requires_screen, url, description)')
      .eq('report_id', report.id)
      .order('sort_order', { ascending: true })
    if (itemsError) {
      console.error('[download-report] Items fetch error:', itemsError.message)
      return NextResponse.json({ error: 'DB error fetching items', detail: itemsError.message }, { status: 500 })
    }
    console.log('[download-report] Step 5 OK: items count =', items?.length ?? 0)

    // Step 6: Import @react-pdf/renderer
    console.log('[download-report] Step 6: Importing @react-pdf/renderer')
    let renderToBuffer: (doc: React.ReactElement) => Promise<Buffer>
    let Document: any, Page: any, Text: any, View: any, StyleSheet: any, Link: any
    try {
      const pdf = await import('@react-pdf/renderer')
      renderToBuffer = pdf.renderToBuffer as any
      Document = pdf.Document
      Page = pdf.Page
      Text = pdf.Text
      View = pdf.View
      StyleSheet = pdf.StyleSheet
      Link = pdf.Link
      console.log('[download-report] Step 6 OK: @react-pdf/renderer loaded, exports:', Object.keys(pdf).join(', '))
    } catch (importErr: any) {
      console.error('[download-report] Step 6 FAILED: import error:', importErr?.message, importErr?.stack)
      return NextResponse.json({ error: 'Failed to import PDF library', detail: importErr?.message, stack: importErr?.stack?.split('\n').slice(0, 5) }, { status: 500 })
    }

    // Step 7: Render PDF
    console.log('[download-report] Step 7: Rendering PDF')
    let buffer: Buffer
    try {
      buffer = await renderToBuffer(
        React.createElement(ReportDocument, {
          report, items: items ?? [], styleProfile: customer.style_profile ?? null, sentAt: report.sent_at,
          Document, Page, Text, View, StyleSheet, Link
        })
      )
      console.log('[download-report] Step 7 OK: buffer size =', buffer.length)
    } catch (renderErr: any) {
      console.error('[download-report] Step 7 FAILED: render error:', renderErr?.message, renderErr?.stack)
      return NextResponse.json({ error: 'Failed to render PDF', detail: renderErr?.message, stack: renderErr?.stack?.split('\n').slice(0, 8) }, { status: 500 })
    }

    console.log('[download-report] Success — returning PDF')
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="homeschool-recommendations.pdf"',
      },
    })

  } catch (err: any) {
    console.error('[download-report] Unhandled error:', err?.message, err?.stack)
    return NextResponse.json({ error: 'Unexpected error', detail: err?.message, stack: err?.stack?.split('\n').slice(0, 8) }, { status: 500 })
  }
}
