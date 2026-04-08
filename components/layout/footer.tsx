'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  const showNewsletter = pathname === '/' || pathname === '/tips' || pathname === '/preview-home'

  return (
    <>
    <section id="newsletter" className="bg-[#3d3d3d] py-14 px-6 text-center" style={{ display: showNewsletter ? '' : 'none' }}>
      <div className="max-w-2xl mx-auto">
        <div className="sender-form-field" data-sender-form-id="bkR0lK"></div>
      </div>
    </section>
    <footer className="bg-[#f5f1e9] border-t border-[#ddd8cc]">
      <div className="max-w-[1100px] mx-auto px-6 py-9 flex flex-col items-center gap-4">
        <div className="w-full flex justify-center">
          <Image src="/Logo.png" alt="Homeschool Connective" width={180} height={108} className="h-[72px] w-auto" />
        </div>
        <ul className="flex flex-wrap justify-center gap-5 text-sm font-bold">
          <li><Link href="/learn" className="text-[#5c5c5c] hover:text-[#ed7c5a] transition-colors">Learn</Link></li>
          <li><Link href="/about" className="text-[#5c5c5c] hover:text-[#ed7c5a] transition-colors">About</Link></li>
          <li><Link href="/tips" className="text-[#5c5c5c] hover:text-[#ed7c5a] transition-colors">Homeschool Tips</Link></li>
          <li><Link href="/contact" className="text-[#5c5c5c] hover:text-[#ed7c5a] transition-colors">Contact</Link></li>
          <li><Link href="/privacy" className="text-[#5c5c5c] hover:text-[#ed7c5a] transition-colors">Privacy Policy</Link></li>
          <li><Link href="/terms" className="text-[#5c5c5c] hover:text-[#ed7c5a] transition-colors">Terms of Service</Link></li>
        </ul>
        <p className="text-xs text-[#5c5c5c]">© 2026 Homeschool Connective, LLC. All rights reserved.</p>
      </div>
    </footer>
    </>
  )
}
