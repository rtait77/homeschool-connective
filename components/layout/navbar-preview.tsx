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

export default function NavbarPreview() {
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

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'white',
        borderBottom: '1px solid #ede9e0',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          maxWidth: '1152px',
          margin: '0 auto',
          padding: '0 16px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ flexShrink: 0, lineHeight: 0 }}>
          <Image
            src="/Logo.png"
            alt="Homeschool Connective"
            width={160}
            height={50}
            style={{ height: '40px', width: 'auto' }}
            priority
          />
        </Link>

        {/* Pill nav — center, desktop */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }} className="hidden md:flex">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: '#f5f1e9',
              border: '1px solid #e8e3da',
              borderRadius: '999px',
              padding: '4px',
            }}
          >
            {activeLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '6px 16px',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: isActive(href) ? 700 : 500,
                  color: isActive(href) ? '#ed7c5a' : '#5c5c5c',
                  background: isActive(href) ? '#ffffff' : 'transparent',
                  boxShadow: isActive(href) ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Consulting — outside pill, teal text link, desktop */}
        <Link
          href="/consulting"
          className="hidden md:block"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: pathname.startsWith('/consulting') ? '#238FA4' : '#55b6ca',
            textDecoration: 'none',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Consulting
        </Link>

        {/* Right side — desktop */}
        <div className="hidden md:flex" style={{ flexShrink: 0, alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label="Account menu"
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#ed7c5a',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {userInitial}
                </span>
                <svg
                  style={{
                    width: '12px',
                    height: '12px',
                    color: '#a09890',
                    transition: 'transform 0.15s',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '208px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '1px solid #eee',
                    padding: '8px 0',
                    zIndex: 50,
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0ece6', marginBottom: '4px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#a09890', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {displayEmail}
                    </p>
                  </div>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 700, color: '#1c1c1c', textDecoration: 'none' }}>
                      Admin Panel
                    </Link>
                  )}
                  <Link href="/dashboard" onClick={() => setDropdownOpen(false)}
                    style={{ display: 'block', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 700, color: '#1c1c1c', textDecoration: 'none' }}>
                    Dashboard
                  </Link>
                  <Link href="/account" onClick={() => setDropdownOpen(false)}
                    style={{ display: 'block', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 700, color: '#1c1c1c', textDecoration: 'none' }}>
                    Account
                  </Link>
                  <div style={{ borderTop: '1px solid #f0ece6', marginTop: '4px', paddingTop: '4px' }}>
                    <button onClick={handleLogout}
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 700, color: '#a09890', cursor: 'pointer' }}>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login"
                style={{ fontSize: '0.875rem', fontWeight: 600, color: '#5c5c5c', textDecoration: 'none' }}>
                Log In
              </Link>
              <Link href="/signup"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  padding: '8px 18px',
                  borderRadius: '999px',
                  background: '#ed7c5a',
                  color: 'white',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}>
                Start Free Trial →
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#1c1c1c', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#1c1c1c', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#1c1c1c', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden" style={{ background: 'white', borderTop: '1px solid #eee', padding: '8px 16px 16px' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'none', margin: 0, padding: 0, fontSize: '0.875rem', fontWeight: 700 }}>
            {activeLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '8px 0', color: isActive(href) ? '#ed7c5a' : '#1c1c1c', textDecoration: 'none' }}>
                  {label}
                </Link>
              </li>
            ))}
            {/* Consulting — separated in mobile too */}
            <li style={{ borderTop: '1px solid #f0ece6', marginTop: '4px', paddingTop: '4px' }}>
              <Link href="/consulting" onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '8px 0', color: '#55b6ca', textDecoration: 'none' }}>
                Consulting
              </Link>
            </li>
            {user ? (
              <>
                <li style={{ borderTop: '1px solid #f0ece6', marginTop: '4px', paddingTop: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#a09890', margin: 0, paddingBottom: '4px' }}>{displayEmail}</p>
                </li>
                {isAdmin && (
                  <li><Link href="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 0', color: '#1c1c1c', textDecoration: 'none' }}>Admin Panel</Link></li>
                )}
                <li><Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 0', color: '#1c1c1c', textDecoration: 'none' }}>Dashboard</Link></li>
                <li><Link href="/account" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 0', color: '#1c1c1c', textDecoration: 'none' }}>Account</Link></li>
                <li>
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: '8px 0', fontSize: '0.875rem', fontWeight: 700, color: '#a09890', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                    Log Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li style={{ borderTop: '1px solid #f0ece6', marginTop: '4px', paddingTop: '4px' }}>
                  <Link href="/signup" onClick={() => setMenuOpen(false)}
                    style={{ display: 'block', padding: '8px 0', color: '#ed7c5a', textDecoration: 'none' }}>
                    Start Free Trial →
                  </Link>
                </li>
                <li>
                  <Link href="/login" onClick={() => setMenuOpen(false)}
                    style={{ display: 'block', padding: '8px 0', color: '#1c1c1c', textDecoration: 'none' }}>
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
