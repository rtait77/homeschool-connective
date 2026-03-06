import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1c1c1c] text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Image src="/Logo.png" alt="Homeschool Connective" width={140} height={40} className="h-10 w-auto brightness-0 invert" />
        <ul className="flex flex-wrap gap-6 text-sm font-bold">
          <li><Link href="/games" className="hover:text-[#ed7c5a] transition-colors">Games</Link></li>
          <li><Link href="/about" className="hover:text-[#ed7c5a] transition-colors">About</Link></li>
          <li><Link href="/tips" className="hover:text-[#ed7c5a] transition-colors">Homeschool Tips</Link></li>
          <li><Link href="/contact" className="hover:text-[#ed7c5a] transition-colors">Contact</Link></li>
        </ul>
        <p className="text-sm text-gray-400">© 2026 Homeschool Connective. All rights reserved.</p>
      </div>
    </footer>
  )
}
