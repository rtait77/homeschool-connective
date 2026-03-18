import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, '')
)

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find users whose trial ends in 1-2 days
  const now = new Date()
  const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
  const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

  const { data: users } = await supabase
    .from('profiles')
    .select('id, trial_end')
    .eq('subscription_status', 'trialing')
    .gte('trial_end', in1Day.toISOString())
    .lte('trial_end', in2Days.toISOString())

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Get emails from auth.users
  let sent = 0
  for (const profile of users) {
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
    if (!authUser?.user?.email) continue

    const email = authUser.user.email
    const trialEnd = new Date(profile.trial_end)
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    await fetch('https://api.sender.net/v2/transactional/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDER_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { name: 'Homeschool Connective', email: 'support@homeschoolconnective.com' },
        to: [{ email }],
        subject: `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style="height: 48px; margin-bottom: 24px;" />
            <h2>Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!</h2>
            <p>Hi there! We hope you've been enjoying your free access to Homeschool Connective games.</p>
            <p>Your 7-day free trial ends on <strong>${trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.</p>
            <p>To keep access to all games, subscribe for just <strong>$5/month</strong> or <strong>$50/year</strong>.</p>
            <a href="https://homeschoolconnective.com/subscribe" style="display: inline-block; background: #ed7c5a; color: white; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; margin-top: 16px;">
              Subscribe Now
            </a>
            <p style="margin-top: 24px; color: #888; font-size: 13px;">Questions? Reply to this email — we're happy to help!</p>
          </div>
        `,
      }),
    })
    sent++
  }

  // --- Consulting intake reminders ---
  // Send at 2 days, 7 days, then every 7 days after that (until intake submitted)
  const { data: pendingConsulting } = await supabase
    .from('consulting_customers')
    .select('id, user_id, paid_at')
    .eq('intake_completed', false)

  let consultingReminders = 0
  for (const c of pendingConsulting ?? []) {
    const daysSince = Math.floor((now.getTime() - new Date(c.paid_at).getTime()) / (1000 * 60 * 60 * 24))
    const shouldSend = daysSince === 2 || daysSince === 7 || (daysSince > 7 && daysSince % 7 === 0)
    if (!shouldSend) continue

    const { data: authUser } = await supabase.auth.admin.getUserById(c.user_id)
    if (!authUser?.user?.email) continue

    const email = authUser.user.email
    const subject = daysSince === 2
      ? 'Don\'t forget — your intake form is waiting!'
      : daysSince === 7
      ? 'Just checking in — have you had a chance to fill out your intake form?'
      : 'Your consulting intake form is still waiting for you'

    await fetch('https://api.sender.net/v2/transactional/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDER_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { name: 'Mel at Homeschool Connective', email: 'consulting@homeschoolconnective.com' },
        to: [{ email }],
        subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <img src="https://homeschoolconnective.com/Logo.png" alt="Homeschool Connective" style="height: 48px; margin-bottom: 24px;" />
            <h2>${subject}</h2>
            <p>Hi! This is a friendly reminder that your intake form is ready and waiting. Once you submit it, I can start working on your personalized curriculum recommendations.</p>
            <p>It saves as you go, so you can fill it out a little at a time — no need to finish in one sitting.</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/intake" style="display: inline-block; background: #ed7c5a; color: white; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; margin-top: 8px;">Complete My Intake Form →</a></p>
            <p style="margin-top: 24px; color: #888; font-size: 13px;">Questions? Just reply to this email — I'm happy to help!</p>
          </div>
        `,
      }),
    })
    consultingReminders++
  }

  return NextResponse.json({ sent, consultingReminders })
}
