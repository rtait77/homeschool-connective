import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { play_id, completed, duration_seconds } = await req.json()
    if (!play_id) return NextResponse.json({ ok: false })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
    )

    await admin.from('game_plays').update({
      ended_at: new Date().toISOString(),
      duration_seconds: duration_seconds ?? null,
      completed: !!completed,
    }).eq('id', play_id)

    return NextResponse.json({ ok: true })
  } catch (_) {
    return NextResponse.json({ ok: false })
  }
}
