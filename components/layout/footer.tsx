import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#f5f1e9] border-t border-[#ddd8cc] mt-6">
      <div className="max-w-[1100px] mx-auto px-6 py-9 flex flex-col items-center gap-4">
        <div className="w-full flex justify-center">
          <Image src="/Logo.png" alt="Homeschool Connective" width={180} height={108} className="h-[72px] w-auto" />
        </div>
        <ul className="flex flex-wrap justify-center gap-5 text-sm font-bold">
          <li><Link href="/games" className="text-[#5c5c5c] hover:text-[#ed7c5a] transition-colors">Games</Link></li>
          <li><Link href="/about" className="text-[#5c5c5c] hover:text-[#ed7c5a] transition-colors">About</Link></li>
          <li><Link href="/tips" className="text-[#5c5c5c] hover:text-[#ed7c5a] transition-colors">Homeschool Tips</Link></li>
          <li><Link href="/contact" className="text-[#5c5c5c] hover:text-[#ed7c5a] transition-colors">Contact</Link></li>
        </ul>
        <p className="text-xs text-[#5c5c5c]">© 2026 Homeschool Connective, LLC. All rights reserved.</p>
      </div>
    </footer>
  )
}
