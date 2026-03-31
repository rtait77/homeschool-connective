'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DashboardSidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/account', label: 'Account Settings' },
  ]

  return (
    <aside className="hidden md:flex flex-col gap-1 w-48 flex-shrink-0 pt-1">
      {links.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              active
                ? 'bg-[#ed7c5a] text-white'
                : 'text-[#5c5c5c] hover:bg-[#ede9e0]'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </aside>
  )
}
