import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
)

export async function POST(req: NextRequest) {
  const { firstName, email, password } = await req.json()

  if (!email || !password || !firstName) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // Check if account already exists
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const alreadyExists = (existing?.users ?? []).some(u => u.email === email)
  if (alreadyExists) {
    return NextResponse.json({ error: 'An account with this email already exists. Please log in first.' }, { status: 409 })
  }

  // Create user — auto-confirmed so they can sign in immediately
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'Could not create account.' }, { status: 500 })
  }

  // Save first name to profile
  await supabase.from('profiles').update({ first_name: firstName.trim() }).eq('id', data.user.id)

  return NextResponse.json({ success: true })
}
