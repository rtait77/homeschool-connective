'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAIL = 'support@homeschoolconnective.com'

type SubType = 'games' | 'consulting' | 'both' | null

const CSS = `
  .nav-inner {
    max-width: 1152px;
    margin: 0 auto;
    padding: 0 16px;
    height: 64px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .nav-pill-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  .nav-pill {
    display: flex;
    align-items: center;
    background: #f5f1e9;
    border: 1px solid #e8e3da;
    border-radius: 999px;
    padding: 4px;
    gap: 2px;
  }
  .nav-pill-divider {
    width: 1px;
    height: 18px;
    background: #d8d3ca;
    margin: 0 4px;
    flex-shrink: 0;
  }
  .nav-pill-link {
    padding: 6px 16px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #5c5c5c;
    background: transparent;
    text-decoration: none;
    white-space: nowrap;
    transition: all 0.15s ease;
  }
  .nav-pill-link:hover {
    color: #1c1c1c;
    background: rgba(255,255,255,0.6);
  }
  .nav-pill-link.active {
    color: #ed7c5a;
    background: #ffffff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  .nav-pill-link.consulting {
    color: #55b6ca;
    font-weight: 600;
  }
  .nav-pill-link.consulting:hover {
    color: #238FA4;
    background: rgba(85,182,202,0.08);
  }
  .nav-pill-link.consulting.active {
    color: #238FA4;
    background: rgba(85,182,202,0.12);
    box-shadow: 0 1px 4px rgba(85,182,202,0.15);
  }
  .nav-pill-link.dashboard {
    color: #ed7c5a;
    font-weight: 700;
  }
  .nav-pill-link.dashboard:hover {
    color: #d96a48;
    background: rgba(237,124,90,0.08);
  }
  .nav-pill-link.dashboard.active {
    color: #d96a48;
    background: rgba(237,124,90,0.12);
    box-shadow: 0 1px 4px rgba(237,124,90,0.15);
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .nav-login {
    font-size: 0.875rem;
    font-weight: 600;
    color: #5c5c5c;
    text-decoration: none;
    transition: color 0.15s;
    white-space: nowrap;
  }
  .nav-login:hover { color: #1c1c1c; }
  .nav-cta {
    font-size: 0.875rem;
    font-weight: 800;
    padding: 8px 18px;
    border-radius: 999px;
    background: #ed7c5a;
    color: white;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.15s ease;
  }
  .nav-cta:hover { background: #d96a48; }
  .nav-dashboard-link {
    font-size: 0.875rem;
    font-weight: 700;
    color: #5c5c5c;
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.15s;
    padding: 6px 4px;
  }
  .nav-dashboard-link:hover { color: #1c1c1c; }
  .nav-dashboard-link.active { color: #ed7c5a; }
  .nav-avatar-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .nav-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #ed7c5a;
    color: white;
    font-size: 0.8rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .nav-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 208px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    border: 1px solid #eee;
    padding: 8px 0;
    z-index: 50;
  }
  .nav-dropdown-email {
    padding: 8px 16px;
    border-bottom: 1px solid #f0ece6;
    margin-bottom: 4px;
    font-size: 0.75rem;
    color: #a09890;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .nav-dropdown-link {
    display: block;
    padding: 8px 16px;
    font-size: 0.875rem;
    font-weight: 700;
    color: #1c1c1c;
    text-decoration: none;
    transition: all 0.1s;
  }
  .nav-dropdown-link:hover { background: #fdf8f5; color: #ed7c5a; }
  .nav-dropdown-btn {
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    padding: 8px 16px;
    font-size: 0.875rem;
    font-weight: 700;
    color: #a09890;
    cursor: pointer;
    transition: all 0.1s;
  }
  .nav-dropdown-btn:hover { background: #fdf8f5; color: #ed7c5a; }

  .desktop-only { display: flex; }
  .hamburger { display: none; }

  .mobile-menu {
    display: none;
    background: white;
    border-top: 1px solid #eee;
    padding: 8px 16px 16px;
  }
  .mobile-menu.open { display: block; }
  .mobile-menu ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.875rem;
    font-weight: 700;
  }
  .mobile-menu a, .mobile-menu button {
    display: block;
    padding: 9px 0;
    color: #1c1c1c;
    text-decoration: none;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
  }
  .mobile-menu a:hover, .mobile-menu button:hover { color: #ed7c5a; }
  .mobile-menu .active-mobile { color: #ed7c5a; }
  .mobile-menu .consulting-mobile { color: #55b6ca; }
  .mobile-menu .cta-mobile { color: #ed7c5a; }
  .mobile-menu .muted-mobile { color: #a09890; }
  .mobile-divider {
    border: none;
    border-top: 1px solid #f0ece6;
    margin: 6px 0;
  }

  @media (max-width: 767px) {
    .desktop-only { display: none !important; }
    .hamburger { display: flex; }
    .nav-pill-wrap { display: none !important; }
  }
`

export default function NavbarPreview() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [subType, setSubType] = useState<SubType>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  useEffect(() => {
    if (isAuthPage) return

    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (!currentUser) return

      const [{ data: profile }, { data: consulting }] = await Promise.all([
        supabase.from('profiles').select('subscription_status, trial_end').eq('id', currentUser.id).single(),
        supabase.from('consulting_customers').select('id').eq('user_id', currentUser.id).maybeSingle(),
      ])

      const trialActive = profile?.trial_end && new Date(profile.trial_end) > new Date()
      const hasGames = profile?.subscription_status === 'active' || !!trialActive
      const hasConsulting = !!consulting

      if (hasGames && hasConsulting) setSubType('both')
      else if (hasGames) setSubType('games')
      else if (hasConsulting) setSubType('consulting')
    }

    loadUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => loadUser())
    return () => subscription.unsubscribe()
  }, [isAuthPage])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    supabase.auth.signOut().catch(() => {})
    setUser(null)
    setSubType(null)
    setDropdownOpen(false)
    setMenuOpen(false)
    router.push('/')
  }

  const isAdmin = user?.email === ADMIN_EMAIL
  const userInitial = user?.email ? user.email[0].toUpperCase() : '?'
  const displayEmail = user?.email ?? ''

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/account'
    return pathname.startsWith(href)
  }

  // Pill links by user state
  let pillLinks: { href: string; label: string; style?: string }[] = []
  let showConsultingInPill = false
  let showDashboardLink = false // separate Dashboard link next to avatar

  if (!user) {
    pillLinks = [
      { href: '/learn', label: 'Learn' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/tips', label: 'Tips' },
      { href: '/about', label: 'About' },
    ]
    showConsultingInPill = true
  } else if (subType === 'consulting') {
    pillLinks = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/tips', label: 'Tips' },
    ]
  } else {
    // games, both, or unknown (default to games links)
    pillLinks = [
      { href: '/learn', label: 'Learn' },
      { href: '/tips', label: 'Tips' },
    ]
    showDashboardLink = true
  }

  // Mobile links
  const mobilePillLinks = pillLinks
  const mobileShowDashboard = showDashboardLink

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: '1px solid #ede9e0', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div className="nav-inner">

          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, lineHeight: 0 }}>
            <Image src="/Logo.png" alt="Homeschool Connective" width={160} height={50} style={{ height: '40px', width: 'auto' }} priority />
          </Link>

          {/* Pill nav — center */}
          <div className="nav-pill-wrap">
            <div className="nav-pill">
              {pillLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={`nav-pill-link${isActive(href) ? ' active' : ''}`}>
                  {label}
                </Link>
              ))}
              {!user && showConsultingInPill && (
                <>
                  <div className="nav-pill-divider" />
                  <Link href="/consulting" className={`nav-pill-link consulting${isActive('/consulting') ? ' active' : ''}`}>
                    Consulting
                  </Link>
                </>
              )}
              {user && showDashboardLink && (
                <>
                  <div className="nav-pill-divider" />
                  <Link href="/dashboard" className={`nav-pill-link dashboard${isActive('/dashboard') ? ' active' : ''}`}>
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="nav-right desktop-only" style={{ marginLeft: user ? 'auto' : undefined }}>
            {user ? (
              <>
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button className="nav-avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="Account menu">
                    <span className="nav-avatar">{userInitial}</span>
                    <svg style={{ width: '12px', height: '12px', color: '#a09890', transition: 'transform 0.15s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="nav-dropdown">
                      <div className="nav-dropdown-email">{displayEmail}</div>
                      {isAdmin && <Link href="/admin" onClick={() => setDropdownOpen(false)} className="nav-dropdown-link">Admin Panel</Link>}
                      <Link href="/contact" onClick={() => setDropdownOpen(false)} className="nav-dropdown-link">Contact</Link>
                      <div style={{ borderTop: '1px solid #f0ece6', marginTop: '4px', paddingTop: '4px' }}>
                        <button onClick={handleLogout} className="nav-dropdown-btn">Log Out</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-login">Log In</Link>
                <Link href="/pricing" className="nav-cta">Start Free Trial →</Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="hamburger"
            style={{ marginLeft: 'auto', flexDirection: 'column', gap: '5px', padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span style={{ display: 'block', width: '24px', height: '2px', background: '#1c1c1c', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ display: 'block', width: '24px', height: '2px', background: '#1c1c1c', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: '24px', height: '2px', background: '#1c1c1c', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <ul>
            {mobilePillLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} onClick={() => setMenuOpen(false)} className={isActive(href) ? 'active-mobile' : ''}>{label}</Link>
              </li>
            ))}
            {showConsultingInPill && (
              <>
                <hr className="mobile-divider" />
                <li>
                  <Link href="/consulting" onClick={() => setMenuOpen(false)} className="consulting-mobile">Consulting</Link>
                </li>
              </>
            )}
            {user ? (
              <>
                <hr className="mobile-divider" />
                {mobileShowDashboard && (
                  <li><Link href="/dashboard" onClick={() => setMenuOpen(false)} className={isActive('/dashboard') ? 'active-mobile' : ''}>Dashboard</Link></li>
                )}
                <li><p style={{ padding: '4px 0 2px', fontSize: '0.75rem', color: '#a09890', margin: 0 }}>{displayEmail}</p></li>
                {isAdmin && <li><Link href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link></li>}
                <li><Link href="/account" onClick={() => setMenuOpen(false)}>Account</Link></li>
                <li><button onClick={handleLogout} className="muted-mobile">Log Out</button></li>
              </>
            ) : (
              <>
                <hr className="mobile-divider" />
                <li><Link href="/pricing" onClick={() => setMenuOpen(false)} className="cta-mobile">Start Free Trial →</Link></li>
                <li><Link href="/login" onClick={() => setMenuOpen(false)}>Log In</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  )
}
