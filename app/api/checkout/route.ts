import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { plan } = await req.json()

  const priceId = plan === 'monthly'
    ? process.env.STRIPE_PRICE_MONTHLY!
    : process.env.STRIPE_PRICE_YEARLY!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe`,
  })

  return NextResponse.json({ url: session.url })
}
