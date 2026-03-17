import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const TRACKED_PATHS = ['/', '/learn', '/pricing', '/tips', '/about', '/contact']

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json()
    if (!path || !TRACKED_PATHS.includes(path)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Try to get logged-in user (optional)
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
      process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
    )

    await admin.from('page_views').insert({ path, user_id: userId })

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
