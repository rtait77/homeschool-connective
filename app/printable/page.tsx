'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function PrintablePage() {
  const params = useSearchParams()
  const file = params.get('file') ?? ''
  const title = params.get('title') ?? 'Printable'
  const from = params.get('from')
  const fileUrl = '/' + file
  const imageUrl = '/' + file.replace('.pdf', '.png')
  const backHref = from === 'home' ? '/#printables' : '/learn?activity=printables'
  const backLabel = from === 'home' ? '← Back to Homepage' : '← Back to Printables'

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href={backHref} className="text-sm font-bold text-[#238FA4] hover:underline">{backLabel}</Link>

      <h1 className="text-2xl font-extrabold mt-6 mb-6">{title}</h1>

      {/* Open PDF button */}
      <div className="flex items-center gap-4 mb-8">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-xl bg-[#ed7c5a] text-white hover:opacity-90 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Open PDF to Print
        </a>
        <p className="text-xs text-[#a09890]">For personal and family use only. Not for redistribution or sharing.</p>
      </div>

      {/* Preview image */}
      <div className="w-full rounded-xl overflow-hidden border border-[#ddd8cc]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={title} className="w-full h-auto block" />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <PrintablePage />
    </Suspense>
  )
}
