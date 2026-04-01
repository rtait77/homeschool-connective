import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
)

async function sendEmail(from: string, to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Resend error ${res.status}: ${text}`)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.metadata?.type === 'consulting' || session.metadata?.type === 'bundle') {
      const customerEmail = session.customer_details?.email ?? ''
      const customerName = session.customer_details?.name ?? 'a new customer'

      // Find or create Supabase user
      let userId: string | null = session.metadata?.supabase_user_id ?? null
      let isNewUser = false
      if (!userId && customerEmail) {
        const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
        const found = (authData?.users ?? []).find(u => u.email === customerEmail)
        if (found) {
          userId = found.id
        } else {
          const { data: created } = await supabase.auth.admin.createUser({
            email: customerEmail,
            email_confirm: true,
          })
          userId = created?.user?.id ?? null
          isNewUser = true
        }
      }

      // Generate password setup link for new users
      let passwordSetupLink = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
      if (isNewUser && customerEmail) {
        const { data: linkData } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: customerEmail,
          options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` },
        })
        if (linkData?.properties?.action_link) {
          passwordSetupLink = linkData.properties.action_link
        }
      }

      // Create consulting_customers record + grant 7-day games trial
      if (userId) {
        const paidAt = new Date()
        const endsAt = new Date(paidAt)
        endsAt.setMonth(endsAt.getMonth() + 3)
        await supabase.from('consulting_customers').insert({
          user_id: userId,
          stripe_session_id: session.id,
          paid_at: paidAt.toISOString(),
          ends_at: endsAt.toISOString(),
        })
        const trialEnd = new Date(paidAt)
        trialEnd.setDate(trialEnd.getDate() + 7)
        const firstName = customerName !== 'a new customer' ? customerName.split(' ')[0] : null
        await supabase.from('profiles')
          .update({
            trial_end: trialEnd.toISOString(),
            subscription_status: 'trialing',
            ...(firstName ? { first_name: firstName } : {}),
          })
          .eq('id', userId)
      }

      // Email to Mel
      try {
        await sendEmail(
          'Homeschool Connective <support@homeschoolconnective.com>',
          'consulting@homeschoolconnective.com',
          'New consulting signup!',
          `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
              <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style="height: 48px; margin-bottom: 24px;" />
              <h2>New consulting signup</h2>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
              <h3>Agreed Terms</h3>
              <ol style="color: #555; font-size: 14px; line-height: 1.7;">
                <li>No refunds once the intake form has been sent.</li>
                <li>Email support for 3 months. Replies within 3–5 business days, generally once per week.</li>
                <li>Curriculum recommendations are suggestions, not guarantees. Final decision is the parent's.</li>
                <li>Family information will not be shared with any third party.</li>
                <li>This is an educational consulting service, not licensed tutoring or therapy.</li>
              </ol>
            </div>
          `
        )
      } catch (err) {
        console.error('Resend error (Mel notification):', err)
      }

      // Email to customer
      if (customerEmail) {
        const quizUrl = process.env.CONSULTING_QUIZ_URL ?? ''
        try {
          await sendEmail(
            'Mel at Homeschool Connective <consulting@homeschoolconnective.com>',
            customerEmail,
            "Welcome! Here's your intake form",
            `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
                <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style="height: 48px; margin-bottom: 24px;" />
                <p style="color: #888; font-size: 13px; font-style: italic;">Welcome email from Mel coming soon. In the meantime, please complete your intake form below — your 3-month window starts today!</p>
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
                ${isNewUser ? `
                <p style="font-size: 15px; margin-bottom: 16px;">First, set up your password to access your dashboard and intake form:</p>
                <p><a href="${passwordSetupLink}" style="display: inline-block; background: #55b6ca; color: white; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; margin-bottom: 20px;">Set Up My Password →</a></p>
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
                ` : ''}
                <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/intake" style="display: inline-block; background: #ed7c5a; color: white; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; margin-bottom: 12px;">Complete Your Intake Form →</a></p>
                ${quizUrl ? `<p style="margin-top: 12px;"><a href="${quizUrl}" style="display: inline-block; background: #55b6ca; color: white; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none;">Take the Learning Style Quiz →</a></p>` : ''}
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
                <h3 style="font-size: 14px;">Your agreed terms</h3>
                <ol style="color: #555; font-size: 13px; line-height: 1.7;">
                  <li>No refunds once the intake form has been sent.</li>
                  <li>Email support for 3 months. Replies within 3–5 business days, generally once per week.</li>
                  <li>Curriculum recommendations are suggestions, not guarantees. Final decision is yours.</li>
                  <li>Your family's information will not be shared with any third party.</li>
                  <li>This is an educational consulting service, not licensed tutoring or therapy.</li>
                </ol>
                <p style="margin-top: 24px; color: #888; font-size: 13px;">Questions? Reply to this email — Mel will get back to you.</p>
              </div>
            `
          )
        } catch (err) {
          console.error('Resend error (customer email):', err)
        }
      }
    }
  }

  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.supabase_user_id
    const customerId = subscription.customer as string

    if (userId && subscription.status === 'active') {
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()
      await supabase.from('profiles').update({
        subscription_status: 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        current_period_end: currentPeriodEnd,
      }).eq('id', userId)

      // Send welcome email
      try {
        const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId)
        const { data: profileData } = await supabase.from('profiles').select('first_name').eq('id', userId).single()
        const customerEmail = authUser?.email ?? ''
        const firstName = profileData?.first_name ?? ''
        const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'
        const interval = subscription.items.data[0]?.plan?.interval ?? 'month'
        const planLabel = interval === 'year' ? 'Yearly Plan ($50/year)' : 'Monthly Plan ($5/month)'
        const renewalDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

        if (customerEmail) {
          await sendEmail(
            'Homeschool Connective <support@homeschoolconnective.com>',
            customerEmail,
            'Welcome to Homeschool Connective!',
            `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
                <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style="height: 48px; margin-bottom: 24px;" />
                <h2 style="color: #1c1c1c;">${greeting}</h2>
                <p style="color: #444; font-size: 15px; line-height: 1.6;">Your subscription is active — you now have full access to all games, lessons, and printables on Homeschool Connective.</p>
                <p style="color: #444; font-size: 14px;"><strong>Plan:</strong> ${planLabel}<br><strong>Renews:</strong> ${renewalDate}</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/learn" style="display: inline-block; background: #ed7c5a; color: white; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; margin: 20px 0;">Start Learning →</a>
                <p style="color: #888; font-size: 13px;">Questions? Reply to this email and we'll get back to you.</p>
              </div>
            `
          )
        }
      } catch (err) {
        console.error('Welcome email error (subscription):', err)
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()

    await supabase.from('profiles')
      .update({ subscription_status: subscription.status, current_period_end: currentPeriodEnd })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    await supabase.from('profiles')
      .update({ subscription_status: 'canceled' })
      .eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
