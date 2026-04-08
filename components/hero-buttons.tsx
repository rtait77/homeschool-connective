'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function HeroButtons() {
  const [hasAccess, setHasAccess] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_end, subscription_status')
        .eq('id', user.id)
        .single()

      const trialActive = profile?.trial_end && new Date(profile.trial_end) > new Date()
      setHasAccess(profile?.subscription_status === 'active' || !!trialActive)
    }
    check()
  }, [])

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {hasAccess ? (
        <Link href="/learn" className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
          Start Learning →
        </Link>
      ) : (
        <Link href="/pricing" className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all">
          Start Free Trial
        </Link>
      )}
      <Link href="/about" className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-lg bg-[#55b6ca] text-white border-2 border-[#55b6ca] hover:bg-white hover:text-[#238FA4] transition-all">
        About Us
      </Link>
    </div>
  )
}
