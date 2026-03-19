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

export default function AdminPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab, setTab] = useState<'overview' | 'users' | 'revenue' | 'gameplay' | 'analytics' | 'consulting'>('overview')

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
  const [consulting, setConsulting] = useState<ConsultingCustomer[] | null>(null)
  const [consultingLoading, setConsultingLoading] = useState(false)
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)

  const [analytics, setAnalytics] = useState<{
    totalAllTime: number
    totalThisMonth: number
    topPages: { path: string; count: number }[]
    dailyVisits: { date: string; count: number }[]
    recentVisits: { path: string; visited_at: string; user_id: string | null }[]
  } | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

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
      .then(data => { setConsulting(data.customers ?? []); setConsultingLoading(false) })
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
  ] as const

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-1">Admin Dashboard</h1>
        <p className="text-sm text-[#5c5c5c]">Homeschool Connective — internal view</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 mb-8 border-b border-[#e2ddd5]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-bold rounded-t-lg border-b-2 transition-all -mb-px cursor-pointer ${
              tab === t.id
                ? 'border-[#ed7c5a] text-[#ed7c5a] bg-white'
                : 'border-transparent text-[#5c5c5c] hover:text-[#ed7c5a]'
            }`}
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
        <div>
          {consultingLoading && <p className="text-sm text-[#5c5c5c]">Loading consulting customers...</p>}
          {consulting && consulting.length === 0 && (
            <p className="text-sm text-[#5c5c5c] bg-[#f5f1e9] rounded-xl px-6 py-8 text-center">No consulting customers yet.</p>
          )}
          {consulting && consulting.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <StatCard label="Total Clients" value={consulting.length} />
                <StatCard label="Intake Submitted" value={consulting.filter(c => c.intake_completed).length} />
                <StatCard label="Pending Intake" value={consulting.filter(c => !c.intake_completed).length} />
              </div>

              <div className="space-y-3">
                {consulting.map(c => {
                  const daysLeft = Math.ceil((new Date(c.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  const isExpanded = expandedCustomer === c.id
                  const r = c.responses as Record<string, unknown> | null
                  return (
                    <div key={c.id} className="bg-white rounded-2xl border border-[#e2ddd5] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      <div
                        className="px-6 py-4 flex items-center justify-between flex-wrap gap-3 cursor-pointer hover:bg-[#fafaf8] transition-colors"
                        onClick={() => setExpandedCustomer(isExpanded ? null : c.id)}
                      >
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="font-bold text-sm">{c.email}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            c.intake_completed
                              ? 'bg-[#d1f5ea] text-[#1a7a52]'
                              : 'bg-[#fff3e0] text-[#b45309]'
                          }`}>
                            {c.intake_completed ? 'Intake submitted' : 'Intake pending'}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            daysLeft > 30 ? 'bg-[#f5f1e9] text-[#5c5c5c]' :
                            daysLeft > 0 ? 'bg-[#fde8e8] text-[#991b1b]' :
                            'bg-[#fde8e8] text-[#991b1b]'
                          }`}>
                            {daysLeft > 0 ? `${daysLeft}d remaining` : 'Expired'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#5c5c5c]">
                          <span>Paid {new Date(c.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-[#e2ddd5]">
                          {!r ? (
                            <p className="text-sm text-[#5c5c5c] mt-4">No intake form responses yet.</p>
                          ) : (
                            <div className="mt-4 space-y-4 text-sm">
                              {(() => {
                                type Child = Record<string, unknown>
                                const children: Child[] = Array.isArray(r.children) ? r.children as Child[] : []
                                const arrStr = (v: unknown) => Array.isArray(v) ? (v as string[]).filter(Boolean).join(', ') || '—' : (v as string) || '—'
                                const s = (v: unknown) => (v as string) || '—'
                                return (
                                  <>
                                    <SummarySection title="Family">
                                      <SummaryRow label="Parent" value={s(r.parentName)} />
                                      <SummaryRow label="State" value={s(r.parentState)} />
                                      {children.map((c, i) => (
                                        <SummaryRow key={i} label={`Child ${i + 1}`} value={`${s(c.name)}, Age ${s(c.age)}`} />
                                      ))}
                                    </SummarySection>

                                    <SummarySection title="About the Parent">
                                      <SummaryRow label="Why homeschooling" value={arrStr(r.whyHomeschooling)} />
                                      <SummaryRow label="Experience" value={s(r.experienceLength)} />
                                      <SummaryRow label="Current experience" value={s(r.currentExperience)} />
                                      <SummaryRow label="#1 goal" value={s(r.primaryGoal)} />
                                      <SummaryRow label="Biggest challenges" value={arrStr(r.biggestChallenges)} />
                                      <SummaryRow label="Curriculum tried" value={`${arrStr(r.curriculumExperience)}${s(r.curriculumTried) !== '—' ? ` — ${r.curriculumTried}` : ''}`} />
                                    </SummarySection>

                                    <SummarySection title="Schedule & Approach">
                                      <SummaryRow label="Days/week" value={s(r.daysPerWeek)} />
                                      <SummaryRow label="Hours/day" value={s(r.hoursPerDay)} />
                                      <SummaryRow label="Other demands" value={arrStr(r.otherDemands)} />
                                      <SummaryRow label="Ideal day" value={arrStr(r.idealDay)} />
                                      <SummaryRow label="Teaching style" value={arrStr(r.teachingStyle)} />
                                      <SummaryRow label="Screens" value={arrStr(r.screenAttitude)} />
                                      <SummaryRow label="Progress measurement" value={arrStr(r.progressMeasurement)} />
                                      <SummaryRow label="Prep willingness" value={s(r.prepWillingness)} />
                                      <SummaryRow label="Environment" value={arrStr(r.learningEnvironment)} />
                                      <SummaryRow label="Co-op" value={arrStr(r.coopParticipation)} />
                                      <SummaryRow label="Personality" value={arrStr(r.parentPersonality)} />
                                    </SummarySection>

                                    <SummarySection title="Vision & Context">
                                      <SummaryRow label="Success in 6 months" value={s(r.successVision)} />
                                      <SummaryRow label="How they heard" value={s(r.howHeard)} />
                                      <SummaryRow label="Parent notes" value={s(r.parentNotes)} />
                                    </SummarySection>

                                    {children.map((c, i) => (
                                      <SummarySection key={i} title={`${s(c.name) !== '—' ? s(c.name) : `Child ${i + 1}`} — Learning Profile`}>
                                        <SummaryRow label="Reading" value={`${s(c.readingLevel)} — feels ${s(c.readingFeel)}`} />
                                        <SummaryRow label="Writing" value={`${s(c.writingStage)} — feels ${s(c.writingFeel)}`} />
                                        <SummaryRow label="Physical writing" value={arrStr(c.physicalWriting)} />
                                        <SummaryRow label="Spelling" value={`${s(c.spellingLevel)} — feels ${s(c.spellingFeel)}`} />
                                        <SummaryRow label="Grammar" value={`${s(c.grammarLevel)} — feels ${s(c.grammarFeel)}`} />
                                        <SummaryRow label="Grammar struggles" value={arrStr(c.grammarStruggles)} />
                                        <SummaryRow label="Focus span" value={s(c.focusSpan)} />
                                        <SummaryRow label="Regulation" value={arrStr(c.regulation)} />
                                        <SummaryRow label="Frustration (child)" value={arrStr(c.frustrationChild)} />
                                        <SummaryRow label="Frustration (parent)" value={arrStr(c.frustrationParent)} />
                                        <SummaryRow label="New tasks" value={arrStr(c.newTasks)} />
                                        <SummaryRow label="Hard tasks" value={arrStr(c.hardTasks)} />
                                        <SummaryRow label="Demonstrates learning" value={arrStr(c.demonstratesUnderstanding)} />
                                        <SummaryRow label="Loves" value={`${arrStr(c.lovesSubjects)}${s(c.lovesOther) !== '—' ? ` + ${c.lovesOther}` : ''}`} />
                                        <SummaryRow label="Avoids" value={arrStr(c.avoidsSubjects)} />
                                        <SummaryRow label="Games" value={arrStr(c.games)} />
                                        <SummaryRow label="Videos" value={arrStr(c.videoEngagement)} />
                                        <SummaryRow label="Extra info" value={`${arrStr(c.extraInfo)}${s(c.diagnosis) !== '—' ? ` (${c.diagnosis})` : ''}`} />
                                      </SummarySection>
                                    ))}
                                  </>
                                )
                              })()}
                            </div>
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
      )}

    </div>
  )
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-extrabold text-xs uppercase tracking-wide text-[#5c5c5c] mb-2">{title}</h4>
      <div className="bg-[#f5f1e9] rounded-xl px-4 py-3 space-y-1.5">{children}</div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-bold text-[#5c5c5c] min-w-[130px] shrink-0">{label}:</span>
      <span className="text-[#1c1c1c]">{value}</span>
    </div>
  )
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60), s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}
