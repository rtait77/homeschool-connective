import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

async function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
  )
}

async function checkAdmin() {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  return user?.email === ADMIN_EMAIL ? user : null
}

// GET /api/admin/resources — list all resources
export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await getAdmin()
  const { data, error } = await admin
    .from('resources')
    .select('id, name, subjects, grade_levels, price_range, requires_screen, time_per_lesson, parent_prep, religious_pref, match_tags, url, description, approved, resource_type')
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ resources: data ?? [] })
}

// POST /api/admin/resources — create a resource
export async function POST(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const admin = await getAdmin()

  const { data, error } = await admin
    .from('resources')
    .insert({
      name: body.name,
      subjects: body.subjects ?? [],
      grade_levels: body.grade_levels ?? [],
      price_range: body.price_range ?? '',
      requires_screen: body.requires_screen ?? 'no',
      time_per_lesson: body.time_per_lesson ?? '',
      parent_prep: body.parent_prep ?? '',
      religious_pref: body.religious_pref ?? 'secular',
      match_tags: body.match_tags ?? [],
      url: body.url ?? null,
      description: body.description ?? null,
      approved: true,
      category: '',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}

// PATCH /api/admin/resources — update a resource
export async function PATCH(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...fields } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const admin = await getAdmin()
  const { error } = await admin.from('resources').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/resources?id=xxx — delete a resource
export async function DELETE(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const admin = await getAdmin()
  await admin.from('resources').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
