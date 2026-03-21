'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

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

export default function ClientReportPage() {
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [items, setItems] = useState<ReportItem[]>([])
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
          <p style={{ fontSize: '0.85rem', color: '#888' }}>
            From Mel at Homeschool Connective
            {report?.sent_at && ` · ${new Date(report.sent_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </p>
        </div>

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
                      {person === 'Parent' ? 'Parent Resources' : person === 'General' ? 'General Recommendations' : `For ${person}`}
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
                                    <span key={p} style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 10px', borderRadius: 999, backgroundColor: p === 'Parent' ? '#fde8e0' : '#e0f4f8', color: p === 'Parent' ? '#c0522a' : '#1a7a8e' }}>{p}</span>
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
