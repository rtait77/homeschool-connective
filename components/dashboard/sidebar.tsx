'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DashboardSidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  const links = [
    ...(isAdmin
      ? [{ href: '/admin', label: 'Admin Panel', teal: true }]
      : [{ href: '/dashboard', label: 'Dashboard', teal: false }]),
    { href: '/account', label: 'Account Settings', teal: false },
  ]

  return (
    <aside className="hidden md:flex flex-col w-48 flex-shrink-0 pt-1 pr-6" style={{ borderRight: '1px solid #ede9e0', boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}>
      <p className="text-xs font-extrabold text-[#a09890] uppercase tracking-widest px-2 mb-3">Menu</p>
      {links.map(({ href, label, teal }) => {
        const active = pathname === href || (href === '/admin' && pathname.startsWith('/admin'))
        return (
          <Link
            key={href}
            href={href}
            className={`block px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
              active
                ? teal ? 'text-[#55b6ca] bg-[#eef8fb]' : 'text-[#ed7c5a] bg-[#fdf3ef]'
                : teal ? 'text-[#55b6ca] hover:bg-[#eef8fb] hover:text-[#238FA4]' : 'text-[#5c5c5c] hover:bg-[#ede9e0] hover:text-[#1c1c1c]'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </aside>
  )
}
