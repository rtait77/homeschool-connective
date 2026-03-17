import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_CONSULTING!, quantity: 1 }],
    metadata: { type: 'consulting' },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/consulting/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/consulting`,
  })

  return NextResponse.json({ url: session.url })
}
