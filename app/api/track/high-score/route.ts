import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s+/g, '')
)

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await authClient.auth.getUser()
    return user?.id ?? null
  } catch { return null }
}

// GET — fetch user's high score for a game
export async function GET(req: NextRequest) {
  const gameTitle = req.nextUrl.searchParams.get('game')
  if (!gameTitle) return NextResponse.json({ error: 'Missing game' }, { status: 400 })

  const userId = await getUserId()
  if (!userId) return NextResponse.json({ highScore: null })

  const { data } = await admin()
    .from('game_high_scores')
    .select('score')
    .eq('user_id', userId)
    .eq('game_title', gameTitle)
    .single()

  return NextResponse.json({ highScore: data?.score ?? null })
}

// POST — save a new score (only updates if higher than existing)
export async function POST(req: NextRequest) {
  try {
    const { game_title, score } = await req.json()
    if (!game_title || score == null) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const userId = await getUserId()
    if (!userId) return NextResponse.json({ saved: false, reason: 'not_logged_in' })

    const db = admin()

    // Check existing score
    const { data: existing } = await db
      .from('game_high_scores')
      .select('id, score')
      .eq('user_id', userId)
      .eq('game_title', game_title)
      .single()

    if (existing && existing.score >= score) {
      return NextResponse.json({ saved: false, reason: 'not_higher', highScore: existing.score })
    }

    if (existing) {
      await db.from('game_high_scores').update({ score, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await db.from('game_high_scores').insert({ user_id: userId, game_title, score })
    }

    return NextResponse.json({ saved: true, highScore: score })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
