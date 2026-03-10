import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

export async function GET() {
  try {
    const authClient = await createServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // All plays with user info
    const { data: plays, error } = await admin
      .from('game_plays')
      .select('id, user_id, game_title, started_at, ended_at, duration_seconds, completed')
      .order('started_at', { ascending: false })
      .limit(500)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const allPlays = plays ?? []

    // Per-game stats
    const gameMap: Record<string, { plays: number; completions: number; totalDuration: number; durationCount: number }> = {}
    for (const p of allPlays) {
      if (!gameMap[p.game_title]) gameMap[p.game_title] = { plays: 0, completions: 0, totalDuration: 0, durationCount: 0 }
      gameMap[p.game_title].plays++
      if (p.completed) gameMap[p.game_title].completions++
      if (p.duration_seconds) {
        gameMap[p.game_title].totalDuration += p.duration_seconds
        gameMap[p.game_title].durationCount++
      }
    }

    const gameStats = Object.entries(gameMap)
      .map(([title, s]) => ({
        title,
        plays: s.plays,
        completions: s.completions,
        avgDuration: s.durationCount > 0 ? Math.round(s.totalDuration / s.durationCount) : null,
      }))
      .sort((a, b) => b.plays - a.plays)

    // Get emails for recent plays
    const userIds = [...new Set(allPlays.slice(0, 50).map(p => p.user_id).filter(Boolean))]
    const emailMap: Record<string, string> = {}
    for (const uid of userIds) {
      try {
        const { data } = await admin.auth.admin.getUserById(uid)
        if (data?.user?.email) emailMap[uid] = data.user.email
      } catch (_) {}
    }

    const recentPlays = allPlays.slice(0, 50).map(p => ({
      id: p.id,
      game_title: p.game_title,
      email: p.user_id ? (emailMap[p.user_id] ?? 'Unknown') : 'Guest',
      duration_seconds: p.duration_seconds,
      completed: p.completed,
      started_at: p.started_at,
    }))

    return NextResponse.json({
      totalPlays: allPlays.length,
      totalCompletions: allPlays.filter(p => p.completed).length,
      gameStats,
      recentPlays,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
