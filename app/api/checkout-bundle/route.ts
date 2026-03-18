import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { plan } = await req.json() // 'monthly' | 'yearly'

  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser()

  const gamesPriceId = plan === 'monthly'
    ? process.env.STRIPE_PRICE_MONTHLY!
    : process.env.STRIPE_PRICE_YEARLY!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        // Consulting one-time add-on, charged at checkout start only
        price_data: {
          currency: 'usd',
          product_data: { name: 'Homeschool Consulting with Mel' },
          unit_amount: 4700,
        },
        quantity: 1,
      },
      {
        price: gamesPriceId,
        quantity: 1,
      },
    ],
    metadata: {
      type: 'bundle',
      bundle_plan: plan,
      ...(user ? { supabase_user_id: user.id } : {}),
    },
    subscription_data: {
      metadata: { supabase_user_id: user?.id ?? '' },
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/consulting/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/consulting`,
  })

  return NextResponse.json({ url: session.url })
}
