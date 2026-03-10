import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

export async function GET() {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  // Fetch active subscriptions (up to 100)
  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    limit: 100,
    expand: ['data.items.data.price'],
  })

  let monthlyCount = 0
  let yearlyCount = 0
  let mrr = 0

  for (const sub of subscriptions.data) {
    for (const item of sub.items.data) {
      const price = item.price
      if (price.recurring?.interval === 'month') {
        monthlyCount++
        mrr += (price.unit_amount ?? 0) / 100
      } else if (price.recurring?.interval === 'year') {
        yearlyCount++
        mrr += (price.unit_amount ?? 0) / 100 / 12
      }
    }
  }

  // Recent successful payments (last 30 days)
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
  const charges = await stripe.charges.list({ limit: 50, created: { gte: thirtyDaysAgo } })

  const recentPayments = charges.data
    .filter(c => c.status === 'succeeded')
    .map(c => ({
      id: c.id,
      amount: c.amount / 100,
      email: c.billing_details?.email ?? '',
      created: new Date(c.created * 1000).toISOString(),
    }))

  return NextResponse.json({
    monthlyCount,
    yearlyCount,
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(mrr * 12 * 100) / 100,
    totalActive: subscriptions.data.length,
    recentPayments,
  })
}
