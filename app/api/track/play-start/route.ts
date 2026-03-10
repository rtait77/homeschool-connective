import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { game_title } = await req.json()
    if (!game_title) return NextResponse.json({ error: 'Missing game_title' }, { status: 400 })

    // Try to get logged-in user (optional — anonymous plays are fine)
    let userId: string | null = null
    try {
      const cookieStore = await cookies()
      const authClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
      )
      const { data: { user } } = await authClient.auth.getUser()
      userId = user?.id ?? null
    } catch (_) {}

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
    )

    const { data, error } = await admin
      .from('game_plays')
      .insert({ user_id: userId, game_title })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ play_id: data.id })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
