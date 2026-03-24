import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Link, renderToBuffer } from '@react-pdf/renderer'

const coral = '#ed7c5a'
const teal = '#55b6ca'
const dark = '#1c1c1c'
const muted = '#666666'
const cream = '#f5f1e9'
const white = '#ffffff'
const borderCol = '#e8e0d5'

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
function ReportDocument({ report, items, styleProfile, sentAt }: { report: any, items: any[], styleProfile: any, sentAt: string }) {
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

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Your Personalized Recommendations</Text>
          <Text style={s.subtitle}>
            From Mel at Homeschool Connective
            {sentAt ? ` · ${new Date(sentAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
          </Text>
        </View>

        {/* Style Profile */}
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

        {/* Custom intro */}
        {report.custom_intro && (
          <View style={s.card}>
            <Text style={s.introText}>{report.custom_intro}</Text>
          </View>
        )}

        {/* Recommendations */}
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

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Questions? Reply to your report email — Mel is happy to help.</Text>
          <Text style={s.footerText}>consulting@homeschoolconnective.com</Text>
        </View>

      </Page>
    </Document>
  )
}

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

  const { data: customer } = await admin
    .from('consulting_customers')
    .select('id, style_profile')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!customer) return NextResponse.json({ error: 'No consulting record' }, { status: 404 })

  const { data: report } = await admin
    .from('reports')
    .select('id, custom_intro, status, sent_at')
    .eq('customer_id', customer.id)
    .maybeSingle()

  if (!report || report.status !== 'sent') {
    return NextResponse.json({ error: 'Report not ready' }, { status: 404 })
  }

  const { data: items } = await admin
    .from('report_items')
    .select('id, reason, sort_order, for_people, resources(name, price_range, requires_screen, url, description)')
    .eq('report_id', report.id)
    .order('sort_order', { ascending: true })

  const buffer = await renderToBuffer(
    <ReportDocument
      report={report}
      items={items ?? []}
      styleProfile={customer.style_profile ?? null}
      sentAt={report.sent_at}
    />
  )

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="homeschool-recommendations.pdf"',
    },
  })
}
