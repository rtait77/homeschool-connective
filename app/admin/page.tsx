'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

type Stats = {
  totalUsers: number
  activeTrials: number
  activeSubscribers: number
  canceled: number
  recentSignups: number
}

type UserRow = {
  id: string
  email: string
  joined: string
  subscription_status: string
  trial_end: string | null
  stripe_customer_id: string | null
}

type Revenue = {
  monthlyCount: number
  yearlyCount: number
  mrr: number
  arr: number
  totalActive: number
  recentPayments: { id: string; amount: number; email: string; created: string }[]
}

type GameStat = {
  title: string
  plays: number
  completions: number
  avgDuration: number | null
}

type RecentPlay = {
  id: string
  game_title: string
  email: string
  duration_seconds: number | null
  completed: boolean
  started_at: string
}

type Gameplay = {
  totalPlays: number
  totalCompletions: number
  gameStats: GameStat[]
  recentPlays: RecentPlay[]
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-[#d1f5ea] text-[#1a7a52]',
  trialing: 'bg-[#fff3e0] text-[#b45309]',
  expired: 'bg-[#fde8e8] text-[#991b1b]',
  canceled: 'bg-[#fde8e8] text-[#991b1b]',
  free: 'bg-[#f3f4f6] text-[#6b7280]',
  unknown: 'bg-[#f3f4f6] text-[#6b7280]',
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? STATUS_COLORS.unknown
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>
      {status}
    </span>
  )
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e2ddd5]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <p className="text-sm font-bold text-[#5c5c5c] mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-[#1c1c1c]">{value}</p>
      {sub && <p className="text-xs text-[#5c5c5c] mt-1">{sub}</p>}
    </div>
  )
}

const TAG_LABELS: Record<string, string> = {
  dyslexia: 'Great for learners with dyslexia',
  ADHD: 'Works well for kids with ADHD',
  gentle_pacing: 'Gentle, no-pressure pace',
  step_by_step: 'Breaks concepts into small, manageable steps',
  encouraging_format: 'Warm, encouraging format — builds confidence',
  mastery_based: 'Mastery-based — move forward when ready, not on a timer',
  no_time_pressure: 'No time pressure',
  hands_on: 'Hands-on and tactile',
  kinesthetic: 'Great for kids who learn by doing and moving',
  game_based: 'Turns learning into a game',
  visual_learner: 'Highly visual',
  auditory_learner: 'Works well for auditory learners',
  discussion_based: 'Built around conversation and discussion',
  read_aloud: 'Designed to be read aloud together',
  literature_based: 'Uses real books and stories',
  self_paced: 'Fully self-paced',
  independent_learner: 'Can run independently with minimal parent involvement',
  teacher_led: 'Teacher-led — parent stays actively involved',
  low_prep: 'Very little prep — open and go',
  structured: 'Clear structure and predictable daily plan',
  flexible_schedule: 'Fits a flexible or irregular schedule',
  short_lessons: 'Short lessons — great for short attention spans',
  minimal_time: 'Works well in a shorter school day',
  multi_child_friendly: 'Works across multiple grade levels at once',
  gifted: 'Well-suited for advanced or gifted learners',
  interest_led: "Follows the child's natural interests",
  project_based: 'Project-based and exploratory',
  no_screen: 'Completely screen-free',
  movement_friendly: 'Works well for kids who need to move',
  short_attention: 'Designed for shorter attention spans',
  reluctant_writer: 'Great for reluctant or resistant writers',
  struggling_reader: 'Specifically designed for struggling readers',
  struggling_spelling: 'Highly effective for spelling struggles',
  early_reading: 'Designed for early readers',
  pre_reading: 'Perfect for pre-reading foundations',
  stem: 'Covers STEM through hands-on activities',
  video_friendly: 'Includes video instruction',
  teacher_intensive: 'Rewards significant parent involvement',
  full_week_ok: 'Works with a full 5-day school week',
  spiral_approach: 'Spiral approach — constantly revisits and reinforces past concepts',
  screen_optional: 'Screen use is optional',
  requires_screen: 'Screen-based',
  advanced_reading: 'For advanced or above-grade-level readers',
  grade_level_reading: 'For on-grade-level readers',
  developing_reading: 'For developing readers',
  early_writing: 'For early-stage writers',
  developing_writing: 'For developing writers',
  advanced_writing: 'For advanced writers',
  early_spelling: 'For early-stage spelling',
  christian: 'Faith-integrated content',
  christian_lite: 'Light faith references (widely used by secular families)',
  neutral: 'Avoids religious content entirely',
  secular: 'Secular — no religious content',
  sensory_friendly: 'Sensory-friendly',
  child_led: 'Child-led learning',
  low_structure: 'Low structure — relaxed and flexible approach',
  math: 'Matches math need',
  science: 'Matches science need',
  history: 'Matches history need',
  reading: 'Matches reading need',
  writing: 'Matches writing need',
  spelling: 'Matches spelling need',
  language_arts: 'Matches language arts need',
  grammar: 'Matches grammar need',
}

const RESOURCE_TYPE_COLORS: Record<string, string> = {
  curriculum: '#ed7c5a',
  book: '#55b6ca',
  website: '#9b7fd4',
  video: '#f0c040',
  toy: '#5bb87a',
  app: '#4a9eff',
  other: '#a09890',
}
const RESOURCE_TYPES = ['', 'curriculum', 'book', 'website', 'video', 'toy', 'app', 'other']

export default function AdminPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab, setTab] = useState<'overview' | 'users' | 'revenue' | 'gameplay' | 'analytics' | 'consulting' | 'resources'>('overview')

  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const [users, setUsers] = useState<UserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState('all')

  const [revenue, setRevenue] = useState<Revenue | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(false)

  const [gameplay, setGameplay] = useState<Gameplay | null>(null)
  const [gameplayLoading, setGameplayLoading] = useState(false)
  const [gameplayError, setGameplayError] = useState('')

  type ConsultingCustomer = {
    id: string
    email: string
    paid_at: string
    ends_at: string
    intake_completed: boolean
    intake_submitted_at: string | null
    intake_status: string
    responses: Record<string, unknown> | null
  }
  type Recommendation = {
    resource_id: string
    name: string
    subjects: string[]
    grade_levels: string[]
    price_range: string
    requires_screen: string
    time_per_lesson: string
    parent_prep: string
    religious_pref: string
    score: number
    matched_tag_count: number
    matched_tags: { tag: string; sources: { question: string; answer: string }[] }[]
    christian_lite_warning: boolean
    reason: string
  }

  const [consulting, setConsulting] = useState<ConsultingCustomer[] | null>(null)
  const [consultingLoading, setConsultingLoading] = useState(false)
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)
  type ReportItem = { id: string; resource_id: string; reason: string; sort_order: number; for_people: string[]; resources?: { name: string; price_range: string; requires_screen: string } | null }
  type ReportMeta = { id: string; status: string; custom_intro: string | null; sent_at: string | null }
  const [recs, setRecs] = useState<Record<string, Recommendation[]>>({})
  const [recsLoading, setRecsLoading] = useState<Record<string, boolean>>({})
  const [recsError, setRecsError] = useState<Record<string, string>>({})
  const [reportItems, setReportItems] = useState<Record<string, ReportItem[]>>({})
  const [reportMeta, setReportMeta] = useState<Record<string, ReportMeta | null>>({})
  const [reportLoading, setReportLoading] = useState<Record<string, boolean>>({})
  const [customIntros, setCustomIntros] = useState<Record<string, string>>({})
  const [sendingReport, setSendingReport] = useState<Record<string, boolean>>({})
  const [sendSuccess, setSendSuccess] = useState<Record<string, boolean>>({})
  const [sendError, setSendError] = useState<Record<string, string>>({})
  const [previewExpanded, setPreviewExpanded] = useState<Record<string, boolean>>({})
  const [previewCustomer, setPreviewCustomer] = useState<string | null>(null)
  const [tagPopup, setTagPopup] = useState<{ name: string; tags: { tag: string; sources: { question: string; answer: string }[] }[] } | null>(null)

  async function loadReportItems(customerId: string) {
    const res = await fetch(`/api/consulting/report?customer_id=${customerId}`)
    if (res.ok) {
      const data = await res.json()
      setReportItems(prev => ({ ...prev, [customerId]: data.items ?? [] }))
      setReportMeta(prev => ({ ...prev, [customerId]: data.report ?? null }))
      if (data.report?.custom_intro) {
        setCustomIntros(prev => ({ ...prev, [customerId]: data.report.custom_intro }))
      }
    }
  }

  async function addToReport(customerId: string, rec: Recommendation) {
    setReportLoading(prev => ({ ...prev, [rec.resource_id]: true }))
    const res = await fetch('/api/consulting/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId, resource_id: rec.resource_id, name: rec.name, reason: rec.reason }),
    })
    if (res.ok) {
      await loadReportItems(customerId)
    }
    setReportLoading(prev => ({ ...prev, [rec.resource_id]: false }))
  }

  async function removeFromReport(customerId: string, itemId: string) {
    await fetch(`/api/consulting/report?item_id=${itemId}`, { method: 'DELETE' })
    setReportItems(prev => ({
      ...prev,
      [customerId]: (prev[customerId] ?? []).filter(i => i.id !== itemId),
    }))
  }

  async function updateItemReason(customerId: string, itemId: string, newReason: string) {
    await fetch('/api/consulting/report', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, reason: newReason }),
    })
    setReportItems(prev => ({
      ...prev,
      [customerId]: (prev[customerId] ?? []).map(i => i.id === itemId ? { ...i, reason: newReason } : i),
    }))
  }

  async function updateItemForPeople(customerId: string, itemId: string, forPeople: string[]) {
    await fetch('/api/consulting/report', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, for_people: forPeople }),
    })
    setReportItems(prev => ({
      ...prev,
      [customerId]: (prev[customerId] ?? []).map(i => i.id === itemId ? { ...i, for_people: forPeople } : i),
    }))
  }

  async function sendReport(customerId: string, clientEmail: string) {
    setSendingReport(prev => ({ ...prev, [customerId]: true }))
    setSendError(prev => ({ ...prev, [customerId]: '' }))
    // Save custom intro first
    const meta = reportMeta[customerId]
    if (meta) {
      await fetch('/api/consulting/report', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: meta.id, custom_intro: customIntros[customerId] ?? '' }),
      })
    }
    const res = await fetch('/api/consulting/report/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId }),
    })
    if (res.ok) {
      setSendSuccess(prev => ({ ...prev, [customerId]: true }))
      await loadReportItems(customerId)
    } else {
      const d = await res.json()
      setSendError(prev => ({ ...prev, [customerId]: d.error ?? 'Failed to send' }))
    }
    setSendingReport(prev => ({ ...prev, [customerId]: false }))
  }

  async function generateRecs(customerId: string) {
    setRecsLoading(prev => ({ ...prev, [customerId]: true }))
    setRecsError(prev => ({ ...prev, [customerId]: '' }))
    try {
      const res = await fetch('/api/consulting/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate recommendations')
      setRecs(prev => ({ ...prev, [customerId]: data.recommendations }))
    } catch (e) {
      setRecsError(prev => ({ ...prev, [customerId]: (e as Error).message }))
    }
    setRecsLoading(prev => ({ ...prev, [customerId]: false }))
  }

  const [analytics, setAnalytics] = useState<{
    totalAllTime: number
    totalThisMonth: number
    topPages: { path: string; count: number }[]
    dailyVisits: { date: string; count: number }[]
    recentVisits: { path: string; visited_at: string; user_id: string | null }[]
  } | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  type Resource = {
    id: string; name: string; subjects: string[]; grade_levels: string[]
    price_range: string; requires_screen: string; time_per_lesson: string
    parent_prep: string; religious_pref: string; match_tags: string[]
    url: string | null; description: string | null; approved: boolean; resource_type: string | null
  }
  const blankResource = (): Omit<Resource, 'id' | 'approved'> => ({
    name: '', subjects: [], grade_levels: [], price_range: '', requires_screen: 'no',
    time_per_lesson: '', parent_prep: '', religious_pref: 'secular', match_tags: [],
    url: '', description: '', resource_type: null,
  })
  const [resources, setResources] = useState<Resource[] | null>(null)
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [addingResource, setAddingResource] = useState(false)
  const [newResource, setNewResource] = useState(blankResource())
  const [resourceSaving, setResourceSaving] = useState(false)
  const [resourceSearch, setResourceSearch] = useState('')

  async function loadResources() {
    setResourcesLoading(true)
    const res = await fetch('/api/admin/resources')
    if (res.ok) {
      const data = await res.json()
      setResources(data.resources)
    }
    setResourcesLoading(false)
  }

  async function saveNewResource() {
    setResourceSaving(true)
    const payload = {
      ...newResource,
      subjects: typeof newResource.subjects === 'string' ? (newResource.subjects as string).split(',').map(s => s.trim()).filter(Boolean) : newResource.subjects,
      grade_levels: typeof newResource.grade_levels === 'string' ? (newResource.grade_levels as string).split(',').map(s => s.trim()).filter(Boolean) : newResource.grade_levels,
      match_tags: typeof newResource.match_tags === 'string' ? (newResource.match_tags as string).split(',').map(s => s.trim()).filter(Boolean) : newResource.match_tags,
    }
    const res = await fetch('/api/admin/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setAddingResource(false)
      setNewResource(blankResource())
      await loadResources()
    }
    setResourceSaving(false)
  }

  async function saveEditResource() {
    if (!editingResource) return
    setResourceSaving(true)
    const payload = {
      ...editingResource,
      subjects: typeof editingResource.subjects === 'string' ? (editingResource.subjects as string).split(',').map(s => s.trim()).filter(Boolean) : editingResource.subjects,
      grade_levels: typeof editingResource.grade_levels === 'string' ? (editingResource.grade_levels as string).split(',').map(s => s.trim()).filter(Boolean) : editingResource.grade_levels,
      match_tags: typeof editingResource.match_tags === 'string' ? (editingResource.match_tags as string).split(',').map(s => s.trim()).filter(Boolean) : editingResource.match_tags,
    }
    await fetch('/api/admin/resources', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setEditingResource(null)
    await loadResources()
    setResourceSaving(false)
  }

  async function deleteResource(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await fetch(`/api/admin/resources?id=${id}`, { method: 'DELETE' })
    setResources(prev => prev?.filter(r => r.id !== id) ?? null)
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/login')
      } else {
        setIsAdmin(true)
      }
      setAuthChecked(true)
    })
  }, [])

  const isDarkTab = tab === 'consulting' || tab === 'resources'
  useEffect(() => {
    if (isDarkTab) {
      document.body.style.backgroundColor = '#16191c'
      document.body.style.color = '#e8e0d5'
    } else {
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }
    return () => {
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }
  }, [isDarkTab])

  // Load overview stats on mount
  useEffect(() => {
    if (!isAdmin) return
    setStatsLoading(true)
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setStatsLoading(false) })
      .catch(() => setStatsLoading(false))
  }, [isAdmin])

  // Load users when tab changes to 'users'
  useEffect(() => {
    if (!isAdmin || tab !== 'users' || users.length > 0) return
    setUsersLoading(true)
    setUsersError('')
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setUsersError(`${data.error}${data.detail ? ': ' + data.detail : ''}`); setUsersLoading(false); return }
        setUsers(data.users ?? [])
        setUsersLoading(false)
      })
      .catch(e => { setUsersError(e.message); setUsersLoading(false) })
  }, [isAdmin, tab])

  // Load revenue when tab changes to 'revenue'
  useEffect(() => {
    if (!isAdmin || tab !== 'revenue' || revenue) return
    setRevenueLoading(true)
    fetch('/api/admin/revenue')
      .then(r => r.json())
      .then(data => { setRevenue(data); setRevenueLoading(false) })
      .catch(() => setRevenueLoading(false))
  }, [isAdmin, tab])

  // Load consulting when tab changes to 'consulting'
  useEffect(() => {
    if (!isAdmin || tab !== 'consulting' || consulting) return
    setConsultingLoading(true)
    fetch('/api/admin/consulting')
      .then(r => r.json())
      .then(data => {
        const customers = data.customers ?? []
        setConsulting(customers)
        setConsultingLoading(false)
        // Load report meta for all customers so sent status shows on collapsed rows
        customers.forEach((c: { id: string }) => loadReportItems(c.id))
      })
      .catch(() => setConsultingLoading(false))
  }, [isAdmin, tab])

  // Load analytics when tab changes to 'analytics'
  useEffect(() => {
    if (!isAdmin || tab !== 'analytics' || analytics) return
    setAnalyticsLoading(true)
    fetch('/api/admin/page-views')
      .then(r => r.json())
      .then(data => { setAnalytics(data); setAnalyticsLoading(false) })
      .catch(() => setAnalyticsLoading(false))
  }, [isAdmin, tab])

  // Load gameplay when tab changes to 'gameplay'
  useEffect(() => {
    if (!isAdmin || tab !== 'gameplay' || gameplay) return
    setGameplayLoading(true)
    setGameplayError('')
    fetch('/api/admin/gameplay')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setGameplayError(data.error); setGameplayLoading(false); return }
        setGameplay(data)
        setGameplayLoading(false)
      })
      .catch(e => { setGameplayError(e.message); setGameplayLoading(false) })
  }, [isAdmin, tab])

  if (!authChecked) {
    return <div className="max-w-[1100px] mx-auto px-6 py-14 text-[#5c5c5c] text-sm">Checking access...</div>
  }

  if (!isAdmin) return null

  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch.trim() || u.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchStatus = userStatusFilter === 'all' || u.subscription_status === userStatusFilter
    return matchSearch && matchStatus
  })

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'gameplay', label: 'Gameplay' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'consulting', label: 'Consulting' },
    { id: 'resources', label: 'Resources' },
  ] as const

  // Preview modal data
  const previewItems = previewCustomer ? (reportItems[previewCustomer] ?? []) : []
  const previewIntro = previewCustomer ? (customIntros[previewCustomer] ?? '') : ''
  const previewClientEmail = previewCustomer ? (consulting?.find(c => c.id === previewCustomer)?.email ?? '') : ''

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">

      {/* Report Preview Modal */}
      {previewCustomer && (
        <div
          onClick={() => setPreviewCustomer(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, overflowY: 'auto', padding: '40px 16px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640, margin: '0 auto', backgroundColor: '#f5f1e9', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
          >
            {/* Modal header */}
            <div style={{ backgroundColor: '#1c1c1c', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a09890', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Preview — {previewClientEmail}</span>
              <button onClick={() => setPreviewCustomer(null)} style={{ color: '#a09890', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
            </div>
            {/* Email body preview */}
            <div style={{ padding: '32px 28px' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style={{ height: 48 }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1c1c1c', marginBottom: 4 }}>Your Personalized Recommendations</h2>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>From Mel at Homeschool Connective</p>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: '#444', marginBottom: 24, whiteSpace: 'pre-line' }}>
                {previewIntro || 'Hi! I\'ve put together your personalized curriculum recommendations based on your intake form. I hope these are a great fit for your family!'}
              </p>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ed7c5a', marginBottom: 14 }}>My Top Picks for Your Family</p>
              {previewItems.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>No items in report yet.</p>
              ) : previewItems.map((item, idx) => {
                const name = item.resources?.name ?? recs[previewCustomer!]?.find(r => r.resource_id === item.resource_id)?.name ?? item.resource_id
                const screen = item.resources?.requires_screen
                const screenLabel = screen === 'yes' ? '🖥 Screen-based' : screen === 'optional' ? '🖥 Screen optional' : '📚 No screen'
                return (
                  <div key={item.id} style={{ marginBottom: 16, padding: '16px 18px', background: '#fff', borderRadius: 10, border: '1px solid #e8e0d5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#55b6ca' }}>#{idx + 1}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#1c1c1c' }}>{name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      {item.resources?.price_range && <span style={{ fontSize: 11, fontWeight: 700, background: '#f5f1e9', color: '#5c5c5c', padding: '2px 8px', borderRadius: 999 }}>{item.resources.price_range}</span>}
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#f5f1e9', color: '#5c5c5c', padding: '2px 8px', borderRadius: 999 }}>{screenLabel}</span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#444', margin: 0 }}>{item.reason}</p>
                  </div>
                )
              })}
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #e8e0d5' }}>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>Questions about any of these? Just reply to this email — I&apos;m happy to talk through them with you!</p>
                <p style={{ fontSize: 13, color: '#888' }}>— Mel</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Popup */}
      {tagPopup && (
        <div
          onClick={() => setTagPopup(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#1e2126', borderRadius: 14, padding: '24px 28px', maxWidth: 480, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', border: '1px solid #3d4248' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#55b6ca', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Matched Tags</p>
                <p style={{ fontWeight: 700, color: '#e8e0d5', fontSize: '0.95rem' }}>{tagPopup.name}</p>
              </div>
              <button onClick={() => setTagPopup(null)} style={{ color: '#a09890', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, marginLeft: 12 }}>✕</button>
            </div>
            {tagPopup.tags.length === 0 ? (
              <p style={{ color: '#a09890', fontSize: '0.85rem', fontStyle: 'italic' }}>No direct tag matches — scored from subject boosts or profile signals.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>
                {tagPopup.tags.map(({ tag, sources }) => (
                  <div key={tag} style={{ backgroundColor: '#13151a', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: sources.length ? 8 : 0 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#2a3a4a', color: '#55b6ca', padding: '2px 8px', borderRadius: 999, flexShrink: 0, marginTop: 1 }}>{tag}</span>
                      <span style={{ fontSize: '0.85rem', color: '#c8bfb5', lineHeight: 1.5 }}>{TAG_LABELS[tag] ?? tag}</span>
                    </div>
                    {sources.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4 }}>
                        {sources.map((src, i) => (
                          <div key={i} style={{ fontSize: '0.75rem', color: '#6a7280', lineHeight: 1.5 }}>
                            <span style={{ color: '#a09890', fontWeight: 700 }}>{src.question}:</span>{' '}
                            <span style={{ color: '#6a7280', fontStyle: 'italic' }}>&ldquo;{src.answer.length > 80 ? src.answer.slice(0, 80) + '…' : src.answer}&rdquo;</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.2rem', color: isDarkTab ? '#e8e0d5' : '#1c1c1c' }}>Admin Dashboard</h1>
        <p style={{ fontSize: '0.85rem', color: isDarkTab ? '#a09890' : '#5c5c5c' }}>Homeschool Connective — internal view</p>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: `1px solid ${isDarkTab ? '#3d4248' : '#e2ddd5'}` }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id)
              if (t.id === 'resources' && !resources) loadResources()
            }}
            style={{
              padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 700,
              borderRadius: '0.5rem 0.5rem 0 0',
              marginBottom: '-1px', cursor: 'pointer', transition: 'all 0.15s',
              color: tab === t.id ? '#ed7c5a' : isDarkTab ? '#a09890' : '#5c5c5c',
              backgroundColor: tab === t.id ? (isDarkTab ? '#24282b' : '#fff') : 'transparent',
              border: 'none', borderBottom: tab === t.id ? '2px solid #ed7c5a' : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div>
          {statsLoading && <p className="text-sm text-[#5c5c5c]">Loading stats...</p>}
          {stats && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                <StatCard label="Total Users" value={stats.totalUsers} />
                <StatCard label="Active Trials" value={stats.activeTrials} />
                <StatCard label="Subscribers" value={stats.activeSubscribers} />
                <StatCard label="Canceled" value={stats.canceled} />
                <StatCard label="New (7 days)" value={stats.recentSignups} sub="signups" />
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#e2ddd5]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h2 className="font-extrabold text-base mb-4">Snapshot</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#5c5c5c] mb-0.5">Trial → Paid conversion</p>
                    <p className="font-bold text-lg">
                      {stats.totalUsers > 0
                        ? `${Math.round((stats.activeSubscribers / stats.totalUsers) * 100)}%`
                        : '—'}
                    </p>
                    <p className="text-xs text-[#5c5c5c]">{stats.activeSubscribers} of {stats.totalUsers} users are paid</p>
                  </div>
                  <div>
                    <p className="text-[#5c5c5c] mb-0.5">Currently in trial</p>
                    <p className="font-bold text-lg">{stats.activeTrials}</p>
                    <p className="text-xs text-[#5c5c5c]">potential conversions</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              type="search"
              placeholder="Search by email..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="px-4 py-2 text-sm rounded-xl border-2 border-[#ddd8cc] bg-white font-semibold placeholder-[#aaa9a4] focus:outline-none focus:border-[#55b6ca] transition-colors w-full sm:w-64"
            />
            <select
              value={userStatusFilter}
              onChange={e => setUserStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm rounded-xl border-2 border-[#ddd8cc] bg-white font-semibold text-[#1c1c1c] focus:outline-none focus:border-[#55b6ca] transition-colors"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="canceled">Canceled</option>
              <option value="free">Free</option>
            </select>
            <span className="text-sm text-[#5c5c5c] self-center">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</span>
          </div>

          {usersLoading && <p className="text-sm text-[#5c5c5c]">Loading users...</p>}
          {usersError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3">{usersError}</p>}

          {!usersLoading && (
            <div className="overflow-x-auto rounded-2xl border border-[#e2ddd5]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f5f1e9] text-left">
                    <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Trial Ends</th>
                    <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Joined</th>
                    <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Stripe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2ddd5]">
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#5c5c5c]">No users found.</td>
                    </tr>
                  )}
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="bg-white hover:bg-[#fafaf8] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#1c1c1c] max-w-[280px] truncate">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={u.subscription_status} />
                      </td>
                      <td className="px-4 py-3 text-[#5c5c5c]">
                        {u.trial_end
                          ? new Date(u.trial_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-[#5c5c5c]">
                        {new Date(u.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        {u.stripe_customer_id ? (
                          <span className="text-xs font-mono text-[#5c5c5c] bg-[#f5f1e9] px-2 py-0.5 rounded">
                            {u.stripe_customer_id.slice(0, 14)}…
                          </span>
                        ) : (
                          <span className="text-xs text-[#aaa9a4]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REVENUE TAB */}
      {tab === 'revenue' && (
        <div>
          {revenueLoading && <p className="text-sm text-[#5c5c5c]">Loading Stripe data...</p>}
          {revenue && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <StatCard label="MRR" value={`$${revenue.mrr.toFixed(2)}`} sub="monthly recurring" />
                <StatCard label="ARR" value={`$${revenue.arr.toFixed(2)}`} sub="annual run rate" />
                <StatCard label="Monthly plans" value={revenue.monthlyCount} sub="$5/mo" />
                <StatCard label="Yearly plans" value={revenue.yearlyCount} sub="$50/yr" />
              </div>

              <div className="bg-white rounded-2xl border border-[#e2ddd5] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="px-6 py-4 border-b border-[#e2ddd5]">
                  <h2 className="font-extrabold text-base">Recent Payments (last 30 days)</h2>
                </div>
                {revenue.recentPayments.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-[#5c5c5c] text-center">No payments in the last 30 days.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f5f1e9] text-left">
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Email</th>
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Amount</th>
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2ddd5]">
                      {revenue.recentPayments.map(p => (
                        <tr key={p.id} className="bg-white hover:bg-[#fafaf8] transition-colors">
                          <td className="px-4 py-3 text-[#1c1c1c] font-semibold">{p.email || '—'}</td>
                          <td className="px-4 py-3 font-bold text-[#1a7a52]">${p.amount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-[#5c5c5c]">
                            {new Date(p.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* GAMEPLAY TAB */}
      {tab === 'gameplay' && (
        <div>
          {gameplayLoading && <p className="text-sm text-[#5c5c5c]">Loading gameplay data...</p>}
          {gameplayError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3">{gameplayError}</p>}
          {gameplay && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <StatCard label="Total Plays" value={gameplay.totalPlays} sub="all custom games" />
                <StatCard label="Completions" value={gameplay.totalCompletions} />
                <StatCard
                  label="Completion Rate"
                  value={gameplay.totalPlays > 0 ? `${Math.round((gameplay.totalCompletions / gameplay.totalPlays) * 100)}%` : '—'}
                />
              </div>

              {/* Per-game stats */}
              <div className="bg-white rounded-2xl border border-[#e2ddd5] overflow-hidden mb-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="px-6 py-4 border-b border-[#e2ddd5]">
                  <h2 className="font-extrabold text-base">Games by Popularity</h2>
                </div>
                {gameplay.gameStats.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-[#5c5c5c] text-center">No plays recorded yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f5f1e9] text-left">
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Game</th>
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Plays</th>
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Completions</th>
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Avg Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2ddd5]">
                      {gameplay.gameStats.map(g => (
                        <tr key={g.title} className="bg-white hover:bg-[#fafaf8] transition-colors">
                          <td className="px-4 py-3 font-semibold text-[#1c1c1c]">{g.title}</td>
                          <td className="px-4 py-3 text-[#1c1c1c]">{g.plays}</td>
                          <td className="px-4 py-3 text-[#1c1c1c]">
                            {g.completions} {g.plays > 0 && <span className="text-xs text-[#5c5c5c]">({Math.round((g.completions / g.plays) * 100)}%)</span>}
                          </td>
                          <td className="px-4 py-3 text-[#5c5c5c]">
                            {g.avgDuration != null ? formatDuration(g.avgDuration) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Recent plays */}
              <div className="bg-white rounded-2xl border border-[#e2ddd5] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="px-6 py-4 border-b border-[#e2ddd5]">
                  <h2 className="font-extrabold text-base">Recent Plays</h2>
                </div>
                {gameplay.recentPlays.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-[#5c5c5c] text-center">No plays recorded yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f5f1e9] text-left">
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">User</th>
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Game</th>
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Duration</th>
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Completed</th>
                        <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2ddd5]">
                      {gameplay.recentPlays.map(p => (
                        <tr key={p.id} className="bg-white hover:bg-[#fafaf8] transition-colors">
                          <td className="px-4 py-3 text-[#1c1c1c] font-semibold truncate max-w-[200px]">{p.email}</td>
                          <td className="px-4 py-3 text-[#1c1c1c]">{p.game_title}</td>
                          <td className="px-4 py-3 text-[#5c5c5c]">{p.duration_seconds != null ? formatDuration(p.duration_seconds) : '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.completed ? 'bg-[#d1f5ea] text-[#1a7a52]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                              {p.completed ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#5c5c5c]">
                            {new Date(p.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === 'analytics' && (
        <div>
          {analyticsLoading && <p className="text-sm text-[#5c5c5c]">Loading analytics...</p>}
          {analytics && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <StatCard label="Total Visits (All Time)" value={analytics.totalAllTime.toLocaleString()} />
                <StatCard label="Visits This Month" value={analytics.totalThisMonth.toLocaleString()} />
              </div>

              {/* Top pages */}
              <div className="bg-white rounded-2xl border border-[#e2ddd5] overflow-hidden mb-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="px-6 py-4 border-b border-[#e2ddd5]">
                  <h2 className="font-extrabold text-base">Top Pages (last 30 days)</h2>
                </div>
                {analytics.topPages.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-[#5c5c5c] text-center">No data yet.</p>
                ) : (
                  <div className="p-6 space-y-3">
                    {analytics.topPages.map(p => {
                      const max = analytics.topPages[0].count
                      return (
                        <div key={p.path}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold">{p.path === '/' ? '/ (Home)' : p.path}</span>
                            <span className="text-[#5c5c5c]">{p.count.toLocaleString()} visits</span>
                          </div>
                          <div className="h-2 bg-[#f5f1e9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#55b6ca] rounded-full"
                              style={{ width: `${Math.round((p.count / max) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Daily visits */}
              <div className="bg-white rounded-2xl border border-[#e2ddd5] overflow-hidden mb-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="px-6 py-4 border-b border-[#e2ddd5]">
                  <h2 className="font-extrabold text-base">Daily Visits (last 30 days)</h2>
                </div>
                {analytics.dailyVisits.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-[#5c5c5c] text-center">No data yet.</p>
                ) : (
                  <div className="p-6">
                    <div className="flex items-end gap-1 h-32">
                      {analytics.dailyVisits.map(d => {
                        const max = Math.max(...analytics.dailyVisits.map(x => x.count))
                        const height = max > 0 ? Math.max(4, Math.round((d.count / max) * 100)) : 4
                        return (
                          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              className="w-full bg-[#ed7c5a] rounded-t-sm hover:bg-[#d96a48] transition-colors"
                              style={{ height: `${height}%` }}
                              title={`${d.date}: ${d.count} visits`}
                            />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-[#5c5c5c] mt-2">
                      <span>{analytics.dailyVisits[0]?.date}</span>
                      <span>{analytics.dailyVisits[analytics.dailyVisits.length - 1]?.date}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent visits */}
              <div className="bg-white rounded-2xl border border-[#e2ddd5] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="px-6 py-4 border-b border-[#e2ddd5]">
                  <h2 className="font-extrabold text-base">Recent Visits</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f5f1e9] text-left">
                      <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Page</th>
                      <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Visitor</th>
                      <th className="px-4 py-3 font-extrabold text-[#5c5c5c] text-xs uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2ddd5]">
                    {analytics.recentVisits.map((v, i) => (
                      <tr key={i} className="bg-white hover:bg-[#fafaf8] transition-colors">
                        <td className="px-4 py-3 font-bold">{v.path === '/' ? '/ (Home)' : v.path}</td>
                        <td className="px-4 py-3 text-[#5c5c5c]">{v.user_id ? 'Member' : 'Guest'}</td>
                        <td className="px-4 py-3 text-[#5c5c5c]">
                          {new Date(v.visited_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* CONSULTING TAB */}
      {tab === 'consulting' && (
        <div style={{ fontFamily: "'Lexend', 'Nunito', sans-serif", lineHeight: '1.8', letterSpacing: '0.02em' }}>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700;800&display=swap');`}</style>

          {/* Dark wrapper */}
          <div style={{ backgroundColor: '#1a1c1e', borderRadius: '1.25rem', padding: '2rem' }}>

            {consultingLoading && <p style={{ color: '#a09890', fontSize: '0.9rem' }}>Loading consulting customers...</p>}
            {consulting && consulting.length === 0 && (
              <p style={{ color: '#a09890', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No consulting customers yet.</p>
            )}

            {consulting && consulting.length > 0 && (
              <>
                {/* Dark stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Total Clients', value: consulting.length },
                    { label: 'Intake Submitted', value: consulting.filter(c => c.intake_completed).length },
                    { label: 'Pending Intake', value: consulting.filter(c => !c.intake_completed).length },
                  ].map(card => (
                    <div key={card.label} style={{ backgroundColor: '#24282b', borderRadius: '1rem', padding: '1.25rem 1.5rem', border: '1px solid #3d4248' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a09890', marginBottom: '0.25rem' }}>{card.label}</p>
                      <p style={{ fontSize: '2rem', fontWeight: 800, color: '#e8e0d5' }}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Client rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {consulting.map(c => {
                    const daysLeft = Math.ceil((new Date(c.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    const isExpanded = expandedCustomer === c.id
                    const r = c.responses as Record<string, unknown> | null
                    return (
                      <div key={c.id} style={{ backgroundColor: '#24282b', borderRadius: '1rem', border: '1px solid #3d4248', overflow: 'hidden' }}>

                        {/* Row header */}
                        <div
                          style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', cursor: 'pointer' }}
                          onClick={() => {
                            const next = isExpanded ? null : c.id
                            setExpandedCustomer(next)
                            if (next && !reportItems[next]) loadReportItems(next)
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, color: '#e8e0d5', fontSize: '0.9rem' }}>{c.email}</span>
                            <span style={{
                              fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '999px',
                              backgroundColor: c.intake_completed ? '#1a3a2a' : '#3a2a10',
                              color: c.intake_completed ? '#5bb87a' : '#f0c040'
                            }}>
                              {c.intake_completed ? 'Intake submitted' : 'Intake pending'}
                            </span>
                            <span style={{
                              fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '999px',
                              backgroundColor: daysLeft > 30 ? '#2a2e32' : '#3a1a1a',
                              color: daysLeft > 30 ? '#a09890' : '#f87171'
                            }}>
                              {daysLeft > 0 ? `${daysLeft}d remaining` : 'Expired'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#a09890' }}>
                            {(reportMeta[c.id]?.sent_at || sendSuccess[c.id]) && (
                              <span style={{ color: '#5bb87a', fontWeight: 700 }}>
                                ✓ Report sent {reportMeta[c.id]?.sent_at ? new Date(reportMeta[c.id]!.sent_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'just now'}
                              </span>
                            )}
                            <span>Paid {new Date(c.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div style={{ borderTop: '1px solid #3d4248', padding: '1.5rem' }}>
                            {!r ? (
                              <p style={{ color: '#a09890', fontSize: '0.9rem', marginTop: '0.5rem' }}>No intake form responses yet.</p>
                            ) : (
                              (() => {
                                type Child = Record<string, unknown>
                                const children: Child[] = Array.isArray(r.children) ? r.children as Child[] : []
                                const toArr = (v: unknown): string[] => Array.isArray(v) ? (v as string[]).filter(Boolean) : []
                                const s = (v: unknown): string => (typeof v === 'string' && v) ? v : '—'
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                    {/* QUICK GLANCE CARD */}
                                    <div style={{ backgroundColor: '#1a1c1e', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', border: '1px solid #55b6ca' }}>
                                      <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#55b6ca', marginBottom: '1rem' }}>Quick Glance</p>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                        <div>
                                          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a09890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Parent</p>
                                          <p style={{ color: '#e8e0d5', fontWeight: 600 }}>{s(r.parentName)} — {s(r.parentState)}</p>
                                        </div>
                                        <div>
                                          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a09890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Experience</p>
                                          <p style={{ color: '#e8e0d5', fontWeight: 600 }}>{s(r.experienceLength)}</p>
                                        </div>
                                        <div>
                                          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a09890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Schedule</p>
                                          <p style={{ color: '#e8e0d5', fontWeight: 600 }}>{s(r.daysPerWeek)} days · {s(r.hoursPerDay)}</p>
                                        </div>
                                        {children.length > 0 && (
                                          <div>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a09890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Children</p>
                                            {children.map((ch, i) => (
                                              <p key={i} style={{ color: '#e8e0d5', fontWeight: 600 }}>{s(ch.name)}, Age {s(ch.age)}</p>
                                            ))}
                                          </div>
                                        )}
                                        {s(r.primaryGoal) !== '—' && (
                                          <div style={{ gridColumn: '1 / -1' }}>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a09890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>#1 Goal</p>
                                            <p style={{ color: '#f0c040', fontWeight: 600 }}>{s(r.primaryGoal)}</p>
                                          </div>
                                        )}
                                        {toArr(r.biggestChallenges).length > 0 && (
                                          <div style={{ gridColumn: '1 / -1' }}>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a09890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Biggest Challenges</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                              {toArr(r.biggestChallenges).map((ch, i) => (
                                                <span key={i} style={{ backgroundColor: '#3a1a1a', color: '#f87171', fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '999px' }}>{ch}</span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {children.filter(ch => s(ch.diagnosis) !== '—').length > 0 && (
                                          <div style={{ gridColumn: '1 / -1' }}>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Diagnosis / Special Needs</p>
                                            {children.filter(ch => s(ch.diagnosis) !== '—').map((ch, i) => (
                                              <p key={i} style={{ color: '#f87171', fontWeight: 600 }}>{s(ch.name)}: {s(ch.diagnosis)}</p>
                                            ))}
                                          </div>
                                        )}
                                        {s(r.religiousPreference) !== '—' && (
                                          <div style={{ gridColumn: '1 / -1' }}>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a09890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Resource Preference</p>
                                            <p style={{ color: '#55b6ca', fontWeight: 600 }}>{s(r.religiousPreference)}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* RECOMMENDATIONS + LIVE PREVIEW side by side */}
                                    <div style={{ display: 'grid', gridTemplateColumns: recs[c.id] ? '1fr 320px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

                                      {/* LEFT: Recommendations */}
                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                          <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ed7c5a' }}>Curriculum Recommendations</p>
                                          <button
                                            onClick={() => generateRecs(c.id)}
                                            disabled={recsLoading[c.id]}
                                            style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.35rem 1rem', borderRadius: '999px', border: '2px solid #ed7c5a', color: recsLoading[c.id] ? '#a09890' : '#ed7c5a', backgroundColor: 'transparent', cursor: recsLoading[c.id] ? 'default' : 'pointer' }}
                                          >
                                            {recsLoading[c.id] ? 'Generating...' : recs[c.id] ? 'Regenerate' : 'Generate Recommendations'}
                                          </button>
                                        </div>
                                        {recsError[c.id] && (
                                          <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{recsError[c.id]}</p>
                                        )}
                                        {recs[c.id] && (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            {recs[c.id].map((rec, idx) => (
                                              <div key={rec.resource_id} style={{ backgroundColor: '#1a1c1e', borderRadius: '0.75rem', padding: '1rem 1.25rem', border: `1px solid ${(reportItems[c.id] ?? []).find(i => i.resource_id === rec.resource_id) ? '#2a4a35' : rec.christian_lite_warning ? '#7a5a10' : '#3d4248'}` }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#55b6ca', minWidth: '1.5rem' }}>#{idx + 1}</span>
                                                    <span style={{ fontWeight: 700, color: '#e8e0d5', fontSize: '0.95rem' }}>{rec.name}</span>
                                                    {rec.christian_lite_warning && (
                                                      <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#3a2a10', color: '#f0c040', padding: '0.15rem 0.6rem', borderRadius: '999px' }}>⚠️ christian lite</span>
                                                    )}
                                                  </div>
                                                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#2e3338', color: '#a09890', padding: '0.15rem 0.6rem', borderRadius: '999px' }}>{rec.price_range}</span>
                                                    <button onClick={() => setTagPopup({ name: rec.name, tags: rec.matched_tags ?? [] })} style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#2e3338', color: '#55b6ca', padding: '0.15rem 0.6rem', borderRadius: '999px', border: 'none', cursor: 'pointer', textDecoration: 'underline dotted' }}>{rec.matched_tag_count} tags matched ⓘ</button>
                                                  </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginTop: '0.25rem' }}>
                                                  <p style={{ fontSize: '0.85rem', color: '#c8bfb5', lineHeight: '1.6', flex: 1 }}>{rec.reason}</p>
                                                  {(() => {
                                                    const inReport = (reportItems[c.id] ?? []).find(i => i.resource_id === rec.resource_id)
                                                    const loading = reportLoading[rec.resource_id]
                                                    return (
                                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                                                        {inReport ? (
                                                          <button
                                                            onClick={() => removeFromReport(c.id, inReport.id)}
                                                            style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.85rem', borderRadius: '999px', border: '2px solid #5bb87a', color: '#5bb87a', backgroundColor: '#1a3a2a', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                          >✓ Added</button>
                                                        ) : (
                                                          <button
                                                            onClick={() => addToReport(c.id, rec)}
                                                            disabled={loading}
                                                            style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.85rem', borderRadius: '999px', border: '2px solid #55b6ca', color: loading ? '#a09890' : '#55b6ca', backgroundColor: 'transparent', cursor: loading ? 'default' : 'pointer', whiteSpace: 'nowrap' }}
                                                          >{loading ? '...' : '+ Add'}</button>
                                                        )}
                                                        {inReport && (
                                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#a09890', textTransform: 'uppercase', letterSpacing: '0.05em' }}>For:</span>
                                                            {['Parent', ...children.map((ch: Record<string, unknown>, ci: number) => {
                                                              const n = typeof ch.name === 'string' && ch.name ? ch.name : `Child ${ci + 1}`
                                                              return n
                                                            })].map(person => {
                                                              const sel = (inReport.for_people ?? []).includes(person)
                                                              return (
                                                                <button key={person} type="button"
                                                                  onClick={() => {
                                                                    const current = inReport.for_people ?? []
                                                                    const next = sel ? current.filter((p: string) => p !== person) : [...current, person]
                                                                    updateItemForPeople(c.id, inReport.id, next)
                                                                  }}
                                                                  style={{ fontSize: '0.62rem', fontWeight: 700, padding: '1px 7px', borderRadius: 999, border: 'none', cursor: 'pointer', backgroundColor: sel ? (person === 'Parent' ? '#fde8e0' : '#e0f4f8') : '#2e3338', color: sel ? (person === 'Parent' ? '#c0522a' : '#1a7a8e') : '#a09890' }}
                                                                >
                                                                  {person}
                                                                </button>
                                                              )
                                                            })}
                                                          </div>
                                                        )}
                                                      </div>
                                                    )
                                                  })()}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* RIGHT: Live email preview */}
                                      {recs[c.id] && (
                                        <div style={{ position: 'sticky', top: '1rem' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5bb87a', margin: 0 }}>
                                              📧 Report Preview
                                              {(reportItems[c.id] ?? []).length > 0 && (
                                                <span style={{ marginLeft: '0.5rem', backgroundColor: '#5bb87a', color: '#0a1f14', borderRadius: '999px', padding: '0.05rem 0.5rem', fontSize: '0.7rem' }}>
                                                  {(reportItems[c.id] ?? []).length}
                                                </span>
                                              )}
                                            </p>
                                            <button
                                              onClick={() => setPreviewExpanded(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                                              style={{ fontSize: '0.7rem', color: '#a09890', background: 'none', border: '1px solid #a09890', borderRadius: '999px', padding: '0.15rem 0.6rem', cursor: 'pointer' }}
                                            >
                                              {previewExpanded[c.id] ? 'Collapse ↑' : 'Expand ↓'}
                                            </button>
                                          </div>
                                          <div style={{ backgroundColor: '#f5f1e9', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #d8d0c4' }}>
                                            {/* Preview body */}
                                            <div style={{ padding: '1rem', maxHeight: previewExpanded[c.id] ? '80vh' : '55vh', overflowY: 'auto', transition: 'max-height 0.2s' }}>
                                              {/* Email header */}
                                              <div style={{ textAlign: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e8e0d5' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style={{ height: 36 }} />
                                                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1c1c1c', margin: '0.4rem 0 0.1rem' }}>Your Personalized Recommendations</p>
                                                <p style={{ fontSize: '0.7rem', color: '#a09890', margin: 0 }}>From Mel at Homeschool Connective</p>
                                              </div>
                                              {/* Intro textarea */}
                                              <textarea
                                                value={customIntros[c.id] ?? ''}
                                                onChange={(e) => setCustomIntros(prev => ({ ...prev, [c.id]: e.target.value }))}
                                                rows={3}
                                                placeholder="Add a personal intro for the client (optional)..."
                                                style={{ width: '100%', backgroundColor: '#fff', border: '1px dashed #c8bfb5', borderRadius: '0.5rem', color: '#444', fontSize: '0.78rem', padding: '0.5rem 0.6rem', resize: 'vertical', lineHeight: '1.6', fontFamily: 'Georgia, serif', marginBottom: '0.75rem', boxSizing: 'border-box' }}
                                              />
                                              <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ed7c5a', marginBottom: '0.5rem' }}>My Top Picks for Your Family</p>
                                              {(reportItems[c.id] ?? []).length === 0 ? (
                                                <p style={{ color: '#a09890', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>
                                                  Click &ldquo;+ Add&rdquo; on any recommendation →
                                                </p>
                                              ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                  {(reportItems[c.id] ?? []).map((item, idx) => {
                                                    const name = item.resources?.name ?? recs[c.id]?.find(r => r.resource_id === item.resource_id)?.name ?? '—'
                                                    return (
                                                      <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '0.5rem', padding: '0.65rem 0.75rem', border: '1px solid #e8e0d5' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#55b6ca' }}>#{idx + 1}</span>
                                                            <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#1c1c1c' }}>{name}</span>
                                                            {(item.for_people ?? []).map(p => (
                                                              <span key={p} style={{ fontSize: '0.6rem', fontWeight: 800, padding: '1px 7px', borderRadius: 999, backgroundColor: p === 'Parent' ? '#fde8e0' : '#e0f4f8', color: p === 'Parent' ? '#c0522a' : '#1a7a8e' }}>{p}</span>
                                                            ))}
                                                          </div>
                                                          <button onClick={() => removeFromReport(c.id, item.id)} style={{ fontSize: '0.75rem', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                                                        </div>
                                                        <textarea
                                                          defaultValue={item.reason}
                                                          onBlur={(e) => updateItemReason(c.id, item.id, e.target.value)}
                                                          rows={2}
                                                          placeholder="Reason..."
                                                          style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderTop: '1px dashed #e8e0d5', color: '#444', fontSize: '0.75rem', padding: '0.3rem 0', resize: 'none', lineHeight: '1.5', fontFamily: 'Georgia, serif', boxSizing: 'border-box', marginTop: '0.3rem' }}
                                                        />
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center', marginTop: '0.4rem', paddingTop: '0.35rem', borderTop: '1px dashed #f0ebe4' }}>
                                                          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#a09890', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.15rem' }}>For:</span>
                                                          {['Parent', ...children.map((ch: Record<string, unknown>, ci: number) => {
                                                            const n = typeof ch.name === 'string' && ch.name ? ch.name : `Child ${ci + 1}`
                                                            return n
                                                          })].map(person => {
                                                            const sel = (item.for_people ?? []).includes(person)
                                                            return (
                                                              <button key={person} type="button"
                                                                onClick={() => {
                                                                  const current = item.for_people ?? []
                                                                  const next = sel ? current.filter((p: string) => p !== person) : [...current, person]
                                                                  updateItemForPeople(c.id, item.id, next)
                                                                }}
                                                                style={{ fontSize: '0.62rem', fontWeight: 700, padding: '1px 7px', borderRadius: 999, border: 'none', cursor: 'pointer', backgroundColor: sel ? (person === 'Parent' ? '#fde8e0' : '#e0f4f8') : '#f0ebe4', color: sel ? (person === 'Parent' ? '#c0522a' : '#1a7a8e') : '#a09890' }}
                                                              >
                                                                {person}
                                                              </button>
                                                            )
                                                          })}
                                                        </div>
                                                      </div>
                                                    )
                                                  })}
                                                </div>
                                              )}
                                              {/* Email footer */}
                                              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e8e0d5' }}>
                                                <p style={{ fontSize: '0.72rem', color: '#a09890', lineHeight: 1.6, margin: '0 0 0.2rem' }}>Questions about any of these? Just reply to this email — I&apos;m happy to talk through them with you!</p>
                                                <p style={{ fontSize: '0.72rem', color: '#a09890', margin: '0 0 0.1rem' }}>— Mel</p>
                                                <p style={{ fontSize: '0.65rem', color: '#c8bfb5', margin: 0 }}>consulting@homeschoolconnective.com</p>
                                              </div>
                                            </div>
                                            {/* Send bar */}
                                            <div style={{ borderTop: '1px solid #d8d0c4', padding: '0.75rem 1rem', backgroundColor: '#ede9e1' }}>
                                              {sendError[c.id] && (
                                                <p style={{ fontSize: '0.72rem', color: '#c0392b', fontWeight: 700, marginBottom: '0.5rem' }}>⚠ {sendError[c.id]}</p>
                                              )}
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {(sendSuccess[c.id] || reportMeta[c.id]?.sent_at) && (
                                                  <span style={{ fontSize: '0.72rem', color: '#5bb87a', fontWeight: 700, marginRight: 'auto' }}>
                                                    ✓ Sent {reportMeta[c.id]?.sent_at ? new Date(reportMeta[c.id]!.sent_at!).toLocaleDateString() : 'just now'}
                                                  </span>
                                                )}
                                                <button
                                                  onClick={() => sendReport(c.id, c.email)}
                                                  disabled={sendingReport[c.id] || (reportItems[c.id] ?? []).length === 0}
                                                  style={{ flex: 1, fontSize: '0.8rem', fontWeight: 700, padding: '0.5rem 0.75rem', borderRadius: '999px', border: 'none', backgroundColor: sendSuccess[c.id] || reportMeta[c.id]?.sent_at ? '#2a6e45' : (reportItems[c.id] ?? []).length === 0 || sendingReport[c.id] ? '#c8bfb5' : '#5bb87a', color: (reportItems[c.id] ?? []).length === 0 || sendingReport[c.id] ? '#888' : '#fff', cursor: (reportItems[c.id] ?? []).length === 0 || sendingReport[c.id] ? 'default' : 'pointer' }}
                                                >
                                                  {sendingReport[c.id] ? 'Sending…' : sendSuccess[c.id] || reportMeta[c.id]?.sent_at ? '✓ Sent — Send Again?' : `Send to ${c.email.split('@')[0]}`}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                    </div>

                                    {/* FULL DETAIL SECTIONS */}
                                    <DarkSummarySection title="Family" color="#b19cd9">
                                      <DarkSummaryRow label="Parent" value={s(r.parentName)} />
                                      <DarkSummaryRow label="State" value={s(r.parentState)} />
                                      {children.map((ch, i) => (
                                        <DarkSummaryRow key={i} label={`Child ${i + 1}`} value={`${s(ch.name)}, Age ${s(ch.age)}`} />
                                      ))}
                                    </DarkSummarySection>

                                    <DarkSummarySection title="About the Parent" color="#ed7c5a">
                                      <DarkSummaryRow label="Why homeschooling" value={toArr(r.whyHomeschooling)} />
                                      <DarkSummaryRow label="Experience" value={s(r.experienceLength)} />
                                      <DarkSummaryRow label="Current experience" value={s(r.currentExperience)} />
                                      <DarkSummaryRow label="#1 goal" value={s(r.primaryGoal)} />
                                      <DarkSummaryRow label="Biggest challenges" value={toArr(r.biggestChallenges)} />
                                      <DarkSummaryRow label="Curriculum experience" value={toArr(r.curriculumExperience)} />
                                      <DarkSummaryRow label="Curriculum tried" value={s(r.curriculumTried)} />
                                    </DarkSummarySection>

                                    <DarkSummarySection title="Schedule & Approach" color="#55b6ca">
                                      <DarkSummaryRow label="Days/week" value={s(r.daysPerWeek)} />
                                      <DarkSummaryRow label="Hours/day" value={s(r.hoursPerDay)} />
                                      <DarkSummaryRow label="Other demands" value={toArr(r.otherDemands)} />
                                      <DarkSummaryRow label="Ideal day" value={toArr(r.idealDay)} />
                                      <DarkSummaryRow label="Teaching style" value={toArr(r.teachingStyle)} />
                                      <DarkSummaryRow label="Screens" value={toArr(r.screenAttitude)} />
                                      <DarkSummaryRow label="Progress measurement" value={toArr(r.progressMeasurement)} />
                                      <DarkSummaryRow label="Prep willingness" value={s(r.prepWillingness)} />
                                      <DarkSummaryRow label="Environment" value={toArr(r.learningEnvironment)} />
                                      <DarkSummaryRow label="Co-op" value={toArr(r.coopParticipation)} />
                                      <DarkSummaryRow label="Personality" value={toArr(r.parentPersonality)} />
                                    </DarkSummarySection>

                                    <DarkSummarySection title="Vision & Context" color="#5bb87a">
                                      <DarkSummaryRow label="Resource preference" value={s(r.religiousPreference)} />
                                      <DarkSummaryRow label="Success in 6 months" value={s(r.successVision)} />
                                      <DarkSummaryRow label="How they heard" value={s(r.howHeard)} />
                                      <DarkSummaryRow label="Parent notes" value={s(r.parentNotes)} />
                                    </DarkSummarySection>

                                    {children.map((ch, i) => (
                                      <DarkSummarySection key={i} title={`${s(ch.name) !== '—' ? s(ch.name) : `Child ${i + 1}`} — Learning Profile`} color="#f0c040">
                                        <DarkSummaryRow label="Reading" value={`${s(ch.readingLevel)} — feels ${s(ch.readingFeel)}`} />
                                        <DarkSummaryRow label="Writing" value={`${s(ch.writingStage)} — feels ${s(ch.writingFeel)}`} />
                                        <DarkSummaryRow label="Physical writing" value={toArr(ch.physicalWriting)} />
                                        <DarkSummaryRow label="Spelling" value={`${s(ch.spellingLevel)} — feels ${s(ch.spellingFeel)}`} />
                                        <DarkSummaryRow label="Grammar" value={`${s(ch.grammarLevel)} — feels ${s(ch.grammarFeel)}`} />
                                        <DarkSummaryRow label="Grammar struggles" value={toArr(ch.grammarStruggles)} />
                                        <DarkSummaryRow label="Focus span" value={s(ch.focusSpan)} />
                                        <DarkSummaryRow label="Regulation" value={toArr(ch.regulation)} />
                                        <DarkSummaryRow label="Frustration (child)" value={toArr(ch.frustrationChild)} />
                                        <DarkSummaryRow label="Frustration (parent)" value={toArr(ch.frustrationParent)} />
                                        <DarkSummaryRow label="New tasks" value={toArr(ch.newTasks)} />
                                        <DarkSummaryRow label="Hard tasks" value={toArr(ch.hardTasks)} />
                                        <DarkSummaryRow label="Demonstrates learning" value={toArr(ch.demonstratesUnderstanding)} />
                                        <DarkSummaryRow label="Loves" value={toArr(ch.lovesSubjects)} />
                                        <DarkSummaryRow label="Avoids" value={toArr(ch.avoidsSubjects)} />
                                        <DarkSummaryRow label="Games" value={toArr(ch.games)} />
                                        <DarkSummaryRow label="Videos" value={toArr(ch.videoEngagement)} />
                                        <DarkSummaryRow label="Extra info" value={toArr(ch.extraInfo)} />
                                        {s(ch.diagnosis) !== '—' && <DarkSummaryRow label="Diagnosis" value={s(ch.diagnosis)} />}
                                      </DarkSummarySection>
                                    ))}
                                  </div>
                                )
                              })()
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* RESOURCES TAB */}
      {tab === 'resources' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e8e0d5', marginBottom: '0.2rem' }}>Curriculum Resources</h2>
              <p style={{ fontSize: '0.8rem', color: '#a09890' }}>{resources?.length ?? 0} resources in database</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                value={resourceSearch}
                onChange={e => setResourceSearch(e.target.value)}
                placeholder="Search resources..."
                style={{ padding: '0.45rem 0.85rem', borderRadius: 999, border: '1px solid #3d4248', backgroundColor: '#2e3338', color: '#e8e0d5', fontSize: '0.85rem', width: 200 }}
              />
              <button
                onClick={() => { setAddingResource(true); setNewResource(blankResource()) }}
                style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem 1.2rem', borderRadius: 999, border: 'none', backgroundColor: '#ed7c5a', color: '#fff', cursor: 'pointer' }}
              >
                + Add Resource
              </button>
            </div>
          </div>

          {resourcesLoading && <p style={{ fontSize: '0.85rem', color: '#a09890' }}>Loading resources...</p>}

          {/* Add Resource form */}
          {addingResource && (
            <ResourceForm
              data={newResource}
              onChange={v => setNewResource(prev => ({ ...prev, ...v }))}
              onSave={saveNewResource}
              onCancel={() => setAddingResource(false)}
              saving={resourceSaving}
              title="Add New Resource"
            />
          )}

          {/* Edit Resource form */}
          {editingResource && (
            <ResourceForm
              data={editingResource}
              onChange={v => setEditingResource(prev => prev ? { ...prev, ...v } : null)}
              onSave={saveEditResource}
              onCancel={() => setEditingResource(null)}
              saving={resourceSaving}
              title={`Edit: ${editingResource.name}`}
            />
          )}

          {/* Resources list */}
          {resources && !addingResource && !editingResource && (
            <div style={{ backgroundColor: '#24282b', borderRadius: '1rem', border: '1px solid #3d4248', overflow: 'hidden' }}>
              {resources
                .filter(r => {
                  if (!resourceSearch) return true
                  const q = resourceSearch.toLowerCase()
                  return r.name.toLowerCase().includes(q) ||
                    r.subjects?.join(' ').toLowerCase().includes(q) ||
                    r.grade_levels?.join(' ').toLowerCase().includes(q) ||
                    r.match_tags?.join(' ').toLowerCase().includes(q) ||
                    r.price_range?.toLowerCase().includes(q) ||
                    r.religious_pref?.toLowerCase().includes(q)
                })
                .map((r, i, arr) => (
                  <div key={r.id} style={{ padding: '0.875rem 1.1rem', borderBottom: i < arr.length - 1 ? '1px solid #3d4248' : 'none', borderLeft: `4px solid ${RESOURCE_TYPE_COLORS[r.resource_type ?? ''] ?? '#3d4248'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#e8e0d5' }}>{r.name}</span>
                          {r.resource_type && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '1px 8px', borderRadius: 999, backgroundColor: `${RESOURCE_TYPE_COLORS[r.resource_type] ?? '#3d4248'}22`, color: RESOURCE_TYPE_COLORS[r.resource_type] ?? '#a09890' }}>{r.resource_type}</span>}
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '1px 8px', borderRadius: 999, backgroundColor: r.religious_pref === 'christian' ? '#3a1a1a' : r.religious_pref === 'christian_lite' ? '#3a2a10' : r.religious_pref === 'neutral' ? '#2a2e32' : '#1a3a2a', color: r.religious_pref === 'christian' ? '#f87171' : r.religious_pref === 'christian_lite' ? '#f0c040' : r.religious_pref === 'neutral' ? '#a09890' : '#5bb87a' }}>{r.religious_pref}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a09890', padding: '1px 8px', borderRadius: 999, backgroundColor: '#2e3338' }}>{r.price_range}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a09890', padding: '1px 8px', borderRadius: 999, backgroundColor: '#2e3338' }}>{r.requires_screen === 'yes' ? '🖥 screen' : r.requires_screen === 'optional' ? '🖥 optional' : '📚 no screen'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {r.subjects?.map(s => <span key={s} style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#1a3a2a', color: '#5bb87a', padding: '1px 7px', borderRadius: 999 }}>{s}</span>)}
                          {r.grade_levels?.map(g => <span key={g} style={{ fontSize: '0.68rem', color: '#a09890', padding: '1px 7px', borderRadius: 999, backgroundColor: '#2e3338' }}>{g}</span>)}
                          {r.match_tags?.map(t => <span key={t} style={{ fontSize: '0.68rem', color: '#55b6ca', padding: '1px 7px', borderRadius: 999, backgroundColor: '#0e2a33' }}>{t}</span>)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button onClick={() => setEditingResource(r)} style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.3rem 0.85rem', borderRadius: 999, border: '1px solid #3d4248', backgroundColor: 'transparent', cursor: 'pointer', color: '#a09890' }}>Edit</button>
                        <button onClick={() => deleteResource(r.id, r.name)} style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.3rem 0.85rem', borderRadius: 999, border: '1px solid #7f1d1d', backgroundColor: 'transparent', cursor: 'pointer', color: '#f87171' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

    </div>
  )
}

function ResourceForm({
  data, onChange, onSave, onCancel, saving, title,
}: {
  data: Record<string, unknown>
  onChange: (v: Record<string, unknown>) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  title: string
}) {
  const inputStyle = { width: '100%', padding: '0.45rem 0.75rem', border: '1px solid #3d4248', borderRadius: 8, fontSize: '0.85rem', boxSizing: 'border-box' as const, backgroundColor: '#1a1d20', color: '#e8e0d5' }
  const labelStyle = { fontSize: '0.68rem', fontWeight: 700, color: '#a09890', textTransform: 'uppercase' as const, letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }
  const field = (label: string, key: string, placeholder?: string) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        value={Array.isArray(data[key]) ? (data[key] as string[]).join(', ') : (data[key] as string) ?? ''}
        onChange={e => onChange({ [key]: e.target.value })}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )
  const select = (label: string, key: string, options: string[]) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        value={(data[key] as string) ?? ''}
        onChange={e => onChange({ [key]: e.target.value })}
        style={{ ...inputStyle, width: '100%' }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
  return (
    <div style={{ backgroundColor: '#24282b', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #3d4248', marginBottom: '1.25rem' }}>
      <h3 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '1.25rem', color: '#e8e0d5' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        {field('Name *', 'name', 'e.g. Khan Academy')}
        {field('Subjects (comma-separated)', 'subjects', 'math, science')}
        {field('Grade Levels (comma-separated)', 'grade_levels', 'K–5, grades 3+')}
        <div>
          {field('Price Range', 'price_range', 'Free, $, $$, $$$')}
          <p style={{ fontSize: '0.65rem', color: '#a09890', marginTop: '0.3rem' }}>Free = free · $ = under $30/yr · $$ = $30–$100/yr · $$$ = $100+/yr</p>
        </div>
        {select('Requires Screen', 'requires_screen', ['no', 'optional', 'yes'])}
        {field('Time per Lesson', 'time_per_lesson', '20–30 min/day')}
        {field('Parent Prep', 'parent_prep', 'minimal, moderate, significant')}
        {select('Resource Type', 'resource_type', RESOURCE_TYPES)}
        {select('Religious Preference', 'religious_pref', ['secular', 'neutral', 'christian_lite', 'christian'])}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Match Tags</label>
          <p style={{ fontSize: '0.65rem', color: '#a09890', marginBottom: '0.5rem' }}>Click to toggle. Selected tags are highlighted.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {Object.keys(TAG_LABELS).map(tag => {
              const selected = ((data['match_tags'] as string[] | string | undefined)
                ? (Array.isArray(data['match_tags']) ? data['match_tags'] : (data['match_tags'] as string).split(',').map((t: string) => t.trim()).filter(Boolean))
                : []).includes(tag)
              const current: string[] = Array.isArray(data['match_tags']) ? data['match_tags'] as string[] : (data['match_tags'] as string || '').split(',').map((t: string) => t.trim()).filter(Boolean)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const next = selected ? current.filter(t => t !== tag) : [...current, tag]
                    onChange({ match_tags: next })
                  }}
                  style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, cursor: 'pointer', border: 'none', backgroundColor: selected ? '#55b6ca' : '#2e3338', color: selected ? '#0e1f24' : '#a09890', transition: 'all 0.1s' }}
                  title={TAG_LABELS[tag]}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
        {field('URL', 'url', 'https://...')}
      </div>
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Description</label>
        <textarea
          value={(data['description'] as string) ?? ''}
          onChange={e => onChange({ description: e.target.value })}
          rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={onSave} disabled={saving} style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem 1.5rem', borderRadius: 999, border: 'none', backgroundColor: saving ? '#3d4248' : '#ed7c5a', color: saving ? '#a09890' : '#fff', cursor: saving ? 'default' : 'pointer' }}>
          {saving ? 'Saving...' : 'Save Resource'}
        </button>
        <button onClick={onCancel} style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem 1.25rem', borderRadius: 999, border: '1px solid #3d4248', backgroundColor: 'transparent', cursor: 'pointer', color: '#a09890' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function DarkSummarySection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color, marginBottom: '0.5rem' }}>{title}</h4>
      <div style={{ backgroundColor: '#2e3338', borderRadius: '0.75rem', padding: '0.875rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: `3px solid ${color}` }}>
        {children}
      </div>
    </div>
  )
}

function DarkSummaryRow({ label, value }: { label: string; value: string | string[] | undefined }) {
  if (!value || value === '—' || (Array.isArray(value) && value.length === 0)) return null
  if (Array.isArray(value)) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 700, color: '#a09890', minWidth: '185px', flexShrink: 0 }}>{label}:</span>
        <ul style={{ margin: '0 0 0 1rem', padding: 0, color: '#e8e0d5', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {value.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
      <span style={{ fontWeight: 700, color: '#a09890', minWidth: '185px', flexShrink: 0 }}>{label}:</span>
      <span style={{ color: '#e8e0d5' }}>{value}</span>
    </div>
  )
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60), s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}
