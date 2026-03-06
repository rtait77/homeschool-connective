'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const links = [
  { href: '/', label: 'Home' },
  { href: '/games', label: 'Games' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/tips', label: 'Homeschool Tips' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Image src="/Logo.png" alt="Homeschool Connective" width={180} height={48} className="h-12 w-auto" priority />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6 font-bold text-sm">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`transition-colors hover:text-[#ed7c5a] ${
                  (href === '/' ? pathname === '/' : pathname.startsWith(href)) ? 'text-[#ed7c5a]' : 'text-[#1c1c1c]'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-[#f5f1e9] text-[#1c1c1c] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#ede9e0] transition"
              >
                Log Out
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-[#f5f1e9] text-[#1c1c1c] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#ede9e0] transition"
              >
                Log In
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-[2px] bg-[#1c1c1c] transition-all ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-[2px] bg-[#1c1c1c] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-[2px] bg-[#1c1c1c] transition-all ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#eee] px-4 pb-4">
          <ul className="flex flex-col gap-1 font-bold text-sm pt-2">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 transition-colors hover:text-[#ed7c5a] ${
                    (href === '/' ? pathname === '/' : pathname.startsWith(href)) ? 'text-[#ed7c5a]' : 'text-[#1c1c1c]'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false) }}
                  className="w-full text-left py-2 font-bold text-[#1c1c1c] hover:text-[#ed7c5a] transition"
                >
                  Log Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 font-bold text-[#1c1c1c] hover:text-[#ed7c5a] transition"
                >
                  Log In
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
