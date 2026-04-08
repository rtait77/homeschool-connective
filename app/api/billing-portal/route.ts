import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

export async function POST() {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
  )

  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  let customerId = profile?.stripe_customer_id as string | undefined

  // Fallback: look up by email in Stripe if not stored in profile
  if (!customerId && user.email) {
    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
      // Persist it so future calls are instant
      await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }
  }

  if (!customerId) {
    return NextResponse.json({ error: 'No billing account found. Please contact support.' }, { status: 400 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
