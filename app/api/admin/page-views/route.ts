import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
    )

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [allTime, thisMonth, byPage, recent, daily] = await Promise.all([
      admin.from('page_views').select('id', { count: 'exact', head: true }),
      admin.from('page_views').select('id', { count: 'exact', head: true }).gte('visited_at', startOfMonth),
      admin.from('page_views').select('path').gte('visited_at', thirtyDaysAgo),
      admin.from('page_views').select('path, visited_at, user_id').order('visited_at', { ascending: false }).limit(20),
      admin.from('page_views').select('visited_at').gte('visited_at', thirtyDaysAgo),
    ])

    // Top pages
    const pageCounts: Record<string, number> = {}
    for (const row of byPage.data ?? []) {
      pageCounts[row.path] = (pageCounts[row.path] ?? 0) + 1
    }
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([path, count]) => ({ path, count }))

    // Daily visits (last 30 days)
    const dailyCounts: Record<string, number> = {}
    for (const row of daily.data ?? []) {
      const day = row.visited_at.slice(0, 10)
      dailyCounts[day] = (dailyCounts[day] ?? 0) + 1
    }
    const dailyVisits = Object.entries(dailyCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }))

    return NextResponse.json({
      totalAllTime: allTime.count ?? 0,
      totalThisMonth: thisMonth.count ?? 0,
      topPages,
      dailyVisits,
      recentVisits: recent.data ?? [],
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
