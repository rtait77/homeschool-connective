'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import dynamic from 'next/dynamic'

type StyleProfile = {
  learningStyles: string[]
  methods: string[]
  teachingStyle: string
}

const LEARNING_STYLE_DESCRIPTIONS: Record<string, string> = {
  Visual: 'Learns best through images, diagrams, maps, drawings, and videos. Tends to take notes, highlight key ideas, and sketch things out. Usually needs a quiet space to focus.',
  Auditory: 'Learns best through sound. Thrives with read-alouds, lectures, and discussion. May hum or put facts to music. Often reads aloud to themselves when working through something hard.',
  Kinesthetic: 'Learns best through movement and activity. Has a hard time sitting still. Tends to fidget, and actually retains information better when their body is engaged — bouncing, acting things out, or doing while learning.',
  Tactile: 'Learns best through touch and hands-on exploration. Loves manipulatives, models, puzzles, and anything they can handle and move. Sensory tools like sandpaper letters or counting with objects work well.',
}

const METHOD_DESCRIPTIONS: Record<string, string> = {
  Traditional: 'Follows a structured approach with clear lesson plans, grade-level progression, and predictable daily routines. Great for families who want an organized, consistent homeschool with clear scope and sequence.',
  Classical: 'Built around the three stages of learning: absorbing facts in the early years, analyzing and debating in the middle years, and communicating with confidence in the teen years. Rewards kids who love memorization, debate, and big ideas.',
  'Charlotte Mason': 'Built around living books (real literature, not textbooks), narration, nature study, and short focused lessons. A great fit for families who love reading aloud and want learning to feel connected to real life.',
  Montessori: 'Child-led and hands-on. The child explores their interests at their own pace with carefully prepared materials. Ideal for families who want to step back and let curiosity drive learning.',
  Waldorf: 'Emphasizes creativity, art, music, storytelling, and movement. A good fit for families who value imagination and artistic expression as central to education and prefer a screen-free, rhythm-based home.',
  Unschooling: 'Child directs their own learning based on interests and passions. No formal curriculum. Best for families who deeply trust child-led learning and want to remove traditional school structure entirely.',
  Eclectic: 'Combines the best of multiple methods to create a customized approach. Great for families who want to pull what works from different philosophies rather than committing to one.',
  'Lifestyle Learning': 'Learning woven into everyday life through field trips, nature walks, hands-on projects, and real conversations. Flexible and creativity-driven.',
}

const TEACHING_STYLE_DESCRIPTIONS: Record<string, string> = {
  'Direct Teacher': 'You like to sit down and teach. You explain, ask questions, and stay actively involved in your child\'s learning.',
  'Facilitator': 'You prefer to set up the environment and materials, then step back and let your child explore and discover.',
  'Read-aloud & Discussion': 'You love reading aloud together and talking about what you\'ve read. Learning happens through conversation and narration.',
  'Experience-based': 'You teach through doing — field trips, documentaries, real-world projects, and getting out into the world.',
  'Resource-dependent': 'You prefer to let a curriculum, app, or video do the primary teaching while you support and guide from the side.',
}

type Resource = {
  name: string
  price_range: string
  requires_screen: string
  url: string | null
  description: string | null
  subjects: string[]
  grade_levels: string[]
}

type ReportItem = {
  id: string
  reason: string
  sort_order: number
  for_people: string[]
  resources: Resource | null
}

type Report = {
  id: string
  custom_intro: string | null
  status: string
  sent_at: string
}

// Client-side PDF generation — no server needed
const ReportPDFDownload = dynamic(
  () => import('@react-pdf/renderer').then(({ PDFDownloadLink, Document, Page, Text, View, StyleSheet, Link: PdfLink }) => {
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

    function ReportDoc({ report, items, styleProfile }: { report: Report, items: ReportItem[], styleProfile: StyleProfile | null }) {
      const hasAssignments = items.some(i => (i.for_people ?? []).length > 0)
      const groups: Record<string, ReportItem[]> = {}
      const peopleOrder: string[] = []
      items.forEach(item => {
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
                {report.sent_at ? ` · ${new Date(report.sent_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
              </Text>
            </View>

            {styleProfile && (styleProfile.learningStyles?.length > 0 || styleProfile.methods?.length > 0 || styleProfile.teachingStyle) && (
              <View style={s.card}>
                <Text style={s.sectionLabel}>YOUR RESULTS AT A GLANCE</Text>
                {styleProfile.learningStyles?.length > 0 && (
                  <View>
                    <Text style={s.subsectionLabel}>HOW YOUR CHILD LEARNS BEST</Text>
                    {styleProfile.learningStyles.map((style, i) => (
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
                    {styleProfile.methods.map((method, i) => (
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
                  {(allItems[person] ?? []).map(item => {
                    globalIdx++
                    const r = item.resources
                    return (
                      <View key={item.id} style={s.itemCard}>
                        <Text style={s.itemNumber}>#{globalIdx}</Text>
                        <View style={s.itemContent}>
                          <Text style={s.itemName}>{r?.name ?? 'Resource'}</Text>
                          <Text style={s.itemReason}>{item.reason}</Text>
                          {r?.url && (
                            <PdfLink src={r.url} style={{ fontSize: 9, color: coral, fontFamily: 'Helvetica-Bold' }}>
                              Learn more →
                            </PdfLink>
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

    return function PDFDownloadButton({ report, items, styleProfile }: { report: Report, items: ReportItem[], styleProfile: StyleProfile | null }) {
      return (
        <PDFDownloadLink
          document={<ReportDoc report={report} items={items} styleProfile={styleProfile} />}
          fileName="homeschool-recommendations.pdf"
          className="no-print"
          style={{ display: 'inline-block', backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 700, fontSize: '0.85rem', padding: '0.5rem 1.25rem', borderRadius: 999, textDecoration: 'none' }}
        >
          {({ loading }: { loading: boolean }) => loading ? 'Preparing PDF...' : '⬇ Download PDF'}
        </PDFDownloadLink>
      )
    }
  }),
  {
    ssr: false,
    loading: () => (
      <span style={{ display: 'inline-block', backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 700, fontSize: '0.85rem', padding: '0.5rem 1.25rem', borderRadius: 999, opacity: 0.6 }}>
        Loading...
      </span>
    ),
  }
)

export default function ClientReportPage() {
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [items, setItems] = useState<ReportItem[]>([])
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notReady, setNotReady] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      fetch('/api/consulting/client-report')
        .then(r => r.json())
        .then(data => {
          if (data.report) {
            setReport(data.report)
            setItems(data.items ?? [])
            setStyleProfile(data.style_profile ?? null)
          } else {
            setNotReady(true)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    })
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f1e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#5c5c5c', fontFamily: 'Nunito, sans-serif' }}>Loading your report…</p>
      </div>
    )
  }

  if (notReady) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f1e9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c1c1c', marginBottom: '0.75rem' }}>Your report isn&apos;t ready yet</h1>
          <p style={{ color: '#5c5c5c', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Mel is reviewing your intake form and putting together your personalized curriculum recommendations. You&apos;ll receive an email when it&apos;s ready!
          </p>
          <Link href="/dashboard/intake" style={{ display: 'inline-block', backgroundColor: '#ed7c5a', color: '#fff', fontWeight: 700, padding: '0.6rem 1.5rem', borderRadius: 999, textDecoration: 'none', fontSize: '0.9rem' }}>
            View My Intake Form →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f1e9', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 20px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo.png" alt="Homeschool Connective" style={{ height: 52, marginBottom: 24 }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1c1c1c', marginBottom: 8 }}>Your Personalized Recommendations</h1>
          <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 20 }}>
            From Mel at Homeschool Connective
            {report?.sent_at && ` · ${new Date(report.sent_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </p>
          {report && (
            <ReportPDFDownload report={report} items={items} styleProfile={styleProfile} />
          )}
        </div>

        {/* Results at a Glance */}
        {styleProfile && (
          <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '28px', marginBottom: 28, border: '1px solid #e8e0d5', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ed7c5a', marginBottom: 20, margin: '0 0 20px' }}>
              Your Results at a Glance
            </p>

            {/* Learning Styles */}
            {styleProfile.learningStyles.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#55b6ca', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                  How Your Child Learns Best
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {styleProfile.learningStyles.map((style, i) => (
                    <div key={style} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff', backgroundColor: i === 0 ? '#ed7c5a' : '#55b6ca', padding: '2px 10px', borderRadius: 999, whiteSpace: 'nowrap', marginTop: 2 }}>
                        {i === 0 ? 'Primary' : i === 1 ? '2nd' : '3rd'}
                      </span>
                      <div>
                        <p style={{ fontWeight: 800, color: '#1c1c1c', margin: '0 0 2px', fontSize: '0.95rem' }}>{style}</p>
                        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6, margin: 0 }}>{LEARNING_STYLE_DESCRIPTIONS[style]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {styleProfile.learningStyles.length > 0 && styleProfile.methods.length > 0 && (
              <div style={{ borderTop: '1px solid #f0ece4', margin: '0 0 24px' }} />
            )}

            {/* Homeschooling Methods */}
            {styleProfile.methods.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#55b6ca', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                  Best-Fit Homeschooling Approaches
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {styleProfile.methods.map((method, i) => (
                    <div key={method} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff', backgroundColor: i === 0 ? '#ed7c5a' : '#55b6ca', padding: '2px 10px', borderRadius: 999, whiteSpace: 'nowrap', marginTop: 2 }}>
                        {i === 0 ? 'Best fit' : i === 1 ? '2nd' : '3rd'}
                      </span>
                      <div>
                        <p style={{ fontWeight: 800, color: '#1c1c1c', margin: '0 0 2px', fontSize: '0.95rem' }}>{method}</p>
                        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6, margin: 0 }}>{METHOD_DESCRIPTIONS[method]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {styleProfile.methods.length > 0 && styleProfile.teachingStyle && (
              <div style={{ borderTop: '1px solid #f0ece4', margin: '0 0 24px' }} />
            )}

            {/* Teaching Style */}
            {styleProfile.teachingStyle && (
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#55b6ca', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                  Your Teaching Style
                </p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff', backgroundColor: '#ed7c5a', padding: '2px 10px', borderRadius: 999, whiteSpace: 'nowrap', marginTop: 2 }}>
                    Your style
                  </span>
                  <div>
                    <p style={{ fontWeight: 800, color: '#1c1c1c', margin: '0 0 2px', fontSize: '0.95rem' }}>{styleProfile.teachingStyle}</p>
                    <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6, margin: 0 }}>{TEACHING_STYLE_DESCRIPTIONS[styleProfile.teachingStyle]}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom intro */}
        {report?.custom_intro && (
          <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '24px 28px', marginBottom: 28, border: '1px solid #e8e0d5', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '1rem', lineHeight: 1.75, color: '#1c1c1c', margin: 0, whiteSpace: 'pre-line' }}>{report.custom_intro}</p>
          </div>
        )}

        {/* Report items — grouped by primary person */}
        {(() => {
          const hasAssignments = items.some(i => (i.for_people ?? []).length > 0)
          const groups: Record<string, ReportItem[]> = {}
          const peopleOrder: string[] = []
          items.forEach(item => {
            const primary = (item.for_people ?? [])[0] ?? 'General'
            if (!groups[primary]) { groups[primary] = []; peopleOrder.push(primary) }
            groups[primary].push(item)
          })
          peopleOrder.sort((a, b) => {
            if (a === 'General') return 1; if (b === 'General') return -1
            if (a === 'Parent') return 1; if (b === 'Parent') return -1
            return 0
          })

          let globalIdx = 0
          const sections = hasAssignments ? peopleOrder : ['General']
          const allItems = hasAssignments ? groups : { General: items }

          return (
            <div style={{ marginBottom: 48 }}>
              {sections.map(person => (
                <div key={person} style={{ marginBottom: 32 }}>
                  {hasAssignments && (
                    <p style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: person === 'Parent' ? '#ed7c5a' : '#55b6ca', marginBottom: 14 }}>
                      {person === 'Parent' ? 'Parent/Guardian Resources' : person === 'General' ? 'General Recommendations' : `For ${person}`}
                    </p>
                  )}
                  {!hasAssignments && (
                    <p style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ed7c5a', marginBottom: 16 }}>
                      My Top Picks for Your Family
                    </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {(allItems[person] ?? []).map(item => {
                      globalIdx++
                      const r = item.resources
                      const allPeople = item.for_people ?? []
                      return (
                        <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '22px 24px', border: '1px solid #e8e0d5', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#55b6ca', minWidth: '1.5rem', paddingTop: 3 }}>#{globalIdx}</span>
                            <div style={{ flex: 1 }}>
                              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1c1c1c', margin: '0 0 6px' }}>{r?.name ?? 'Resource'}</h2>
                              {allPeople.length > 1 && (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                  {allPeople.map(p => (
                                    <span key={p} style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 10px', borderRadius: 999, backgroundColor: p === 'Parent' ? '#f9d0e8' : '#e8d9ff', color: p === 'Parent' ? '#9d174d' : '#6d28d9' }}>{p === 'Parent' ? 'Parent/Guardian' : p}</span>
                                  ))}
                                </div>
                              )}
                              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#444', margin: '0 0 12px' }}>{item.reason}</p>
                              {r?.url && (
                                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ed7c5a', textDecoration: 'none' }}>
                                  Learn more →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Footer */}
        <div style={{ textAlign: 'center', borderTop: '1px solid #e8e0d5', paddingTop: 32 }}>
          <p style={{ fontSize: '0.9rem', color: '#5c5c5c', lineHeight: 1.7, marginBottom: 8 }}>
            Questions about any of these recommendations? Reply to your report email — Mel is happy to help!
          </p>
          <p style={{ fontSize: '0.85rem', color: '#888' }}>consulting@homeschoolconnective.com</p>
        </div>

      </div>
    </div>
  )
}
