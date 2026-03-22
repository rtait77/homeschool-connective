import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const titanTransport = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 587,
  secure: false,
  auth: {
    user: 'consulting@homeschoolconnective.com',
    pass: process.env.TITAN_SMTP_PASSWORD,
  },
})

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
)

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

      // Find Supabase user_id — prefer metadata, fallback to email lookup
      let userId: string | null = session.metadata?.supabase_user_id ?? null
      if (!userId && customerEmail) {
        const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
        const found = (authData?.users ?? []).find(u => u.email === customerEmail)
        userId = found?.id ?? null
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
        // Give consulting buyers a 7-day free trial of games
        const trialEnd = new Date(paidAt)
        trialEnd.setDate(trialEnd.getDate() + 7)
        await supabase.from('profiles')
          .update({ trial_end: trialEnd.toISOString() })
          .eq('id', userId)
      }

      // Email to Mel (via Titan SMTP)
      await titanTransport.sendMail({
        from: '"Homeschool Connective" <consulting@homeschoolconnective.com>',
        to: 'consulting@homeschoolconnective.com',
        subject: 'New consulting signup!',
        html: `
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
        `,
      })

      // Email to customer
      if (customerEmail) {
        const intakeFormUrl = process.env.CONSULTING_INTAKE_FORM_URL ?? ''
        const quizUrl = process.env.CONSULTING_QUIZ_URL ?? ''

        await fetch('https://api.sender.net/v2/transactional/email', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDER_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: { name: 'Mel at Homeschool Connective', email: 'consulting@homeschoolconnective.com' },
            to: [{ email: customerEmail }],
            subject: 'Welcome! Here\'s your intake form',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
                <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style="height: 48px; margin-bottom: 24px;" />
                <p style="color: #888; font-size: 13px; font-style: italic;">Welcome email from Mel coming soon. In the meantime, please complete your intake form below — your 3-month window starts today!</p>
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
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
            `,
          }),
        })
      }
    }
  }

  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.supabase_user_id
    const customerId = subscription.customer as string

    if (userId && subscription.status === 'active') {
      await supabase.from('profiles').update({
        subscription_status: 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
      }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    await supabase.from('profiles')
      .update({ subscription_status: subscription.status })
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
