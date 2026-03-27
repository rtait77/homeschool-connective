'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const guestLinks = [
  { href: '/learn', label: 'Learn' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/tips', label: 'Tips' },
  { href: '/about', label: 'About' },
]

const memberLinks = [
  { href: '/learn', label: 'Learn' },
  { href: '/tips', label: 'Tips' },
  { href: '/about', label: 'About' },
]

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    setMenuOpen(false)
    router.push('/')
  }

  const isAdmin = user?.email === ADMIN_EMAIL
  const activeLinks = user ? memberLinks : guestLinks
  const userInitial = user?.email ? user.email[0].toUpperCase() : '?'
  const displayEmail = user?.email ?? ''

  return (
    <nav className="sticky top-0 z-50 shadow-sm">

      {/* Top bar */}
      <div className="bg-[#f5f1e9] border-b border-[#e8e3da]">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex justify-end items-center gap-5">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 group"
                aria-label="Account menu"
              >
                <span className="w-7 h-7 rounded-full bg-[#ed7c5a] text-white text-xs font-extrabold flex items-center justify-center select-none group-hover:opacity-90 transition">
                  {userInitial}
                </span>
                <svg
                  className={`w-3 h-3 text-[#a09890] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#eee] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#f0ece6] mb-1">
                    <p className="text-xs text-[#a09890] truncate">{displayEmail}</p>
                  </div>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm font-bold text-[#1c1c1c] hover:bg-[#fdf8f5] hover:text-[#ed7c5a] transition">
                      Admin Panel
                    </Link>
                  )}
                  <Link href="/dashboard" onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm font-bold text-[#1c1c1c] hover:bg-[#fdf8f5] hover:text-[#ed7c5a] transition">
                    Dashboard
                  </Link>
                  <Link href="/account" onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm font-bold text-[#1c1c1c] hover:bg-[#fdf8f5] hover:text-[#ed7c5a] transition">
                    Account
                  </Link>
                  <div className="border-t border-[#f0ece6] mt-1 pt-1">
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-[#a09890] hover:bg-[#fdf8f5] hover:text-[#ed7c5a] transition">
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-xs font-bold text-[#5c5c5c] hover:text-[#ed7c5a] transition">
                → Log In
              </Link>
              <Link href="/consulting" className="text-xs font-bold text-[#55b6ca] hover:text-[#238FA4] transition">
                Get Homeschooling Help
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main nav row */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <Image src="/Logo.png" alt="Homeschool Connective" width={180} height={56} className="h-14 w-auto" priority />
            </Link>

            {/* Desktop links */}
            <ul className="hidden md:flex items-center gap-6 font-bold text-sm">
              {activeLinks.map(({ href, label }) => (
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
            </ul>
          </div>

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
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#eee] px-4 pb-4">
          <ul className="flex flex-col gap-1 font-bold text-sm pt-2">
            {activeLinks.map(({ href, label }) => (
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
            {user ? (
              <>
                <li className="pt-2 border-t border-[#f0ece6]">
                  <p className="py-1 text-xs text-[#a09890]">{displayEmail}</p>
                </li>
                {isAdmin && (
                  <li><Link href="/admin" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-[#ed7c5a] transition">Admin Panel</Link></li>
                )}
                <li><Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-[#ed7c5a] transition">Dashboard</Link></li>
                <li><Link href="/account" onClick={() => setMenuOpen(false)} className="block py-2 hover:text-[#ed7c5a] transition">Account</Link></li>
                <li>
                  <button onClick={handleLogout} className="w-full text-left py-2 font-bold text-[#a09890] hover:text-[#ed7c5a] transition">
                    Log Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="pt-2 border-t border-[#f0ece6]">
                  <Link href="/consulting" onClick={() => setMenuOpen(false)} className="block py-2 font-bold text-[#55b6ca] hover:text-[#238FA4] transition">
                    Get Homeschooling Help
                  </Link>
                </li>
                <li>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-2 font-bold text-[#1c1c1c] hover:text-[#ed7c5a] transition">
                    Log In
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  )
}
