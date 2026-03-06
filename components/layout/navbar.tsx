'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/games', label: 'Games' },
  { href: '/tips', label: 'Homeschool Tips' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Image src="/Logo.png" alt="Homeschool Connective" width={180} height={48} className="h-12 w-auto" priority />
        </Link>
        <ul className="hidden md:flex items-center gap-6 font-bold text-sm">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`transition-colors hover:text-[#ed7c5a] ${
                  pathname === href ? 'text-[#ed7c5a]' : 'text-[#1c1c1c]'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
