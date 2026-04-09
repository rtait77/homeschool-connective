import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_CONSULTING) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  // Auth is optional — new visitors can pay without an account
  const { data: { user } } = await authClient.auth.getUser()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_CONSULTING!, quantity: 1 }],
    customer_creation: 'always',
    ...(user ? { customer_email: user.email } : {}),
    metadata: {
      type: 'consulting',
      ...(user ? { supabase_user_id: user.id } : {}),
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/consulting/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/consulting`,
  })

  return NextResponse.json({ url: session.url })
}
