'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function PrintablePage() {
  const params = useSearchParams()
  const file = params.get('file') ?? ''
  const title = params.get('title') ?? 'Printable'
  // PDFs not yet uploaded — use the PNG preview instead
  const imageUrl = '/' + file.replace('.pdf', '.png')

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/learn?activity=printables" className="text-sm font-bold text-[#238FA4] hover:underline">← Back to Printables</Link>

      <h1 className="text-2xl font-extrabold mt-6 mb-2">{title}</h1>

      {/* Instructions box */}
      <div className="bg-[#f5f1e9] border border-[#ddd8cc] rounded-xl p-5 mb-6">
        <p className="font-extrabold text-sm mb-2">How to save as PDF:</p>
        <ol className="text-sm text-[#5c5c5c] space-y-1 list-decimal list-inside">
          <li>Click the <strong>Print</strong> button below</li>
          <li>Change the <strong>Destination</strong> to <strong>Save as PDF</strong></li>
          <li>Click <strong>Save</strong></li>
        </ol>
      </div>

      {/* Print button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 font-extrabold text-sm px-6 py-3 rounded-xl bg-[#ed7c5a] text-white hover:opacity-90 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Save as PDF
        </button>
        <p className="text-xs text-[#a09890]">For personal and family use only. Not for redistribution or sharing.</p>
      </div>

      {/* Printable preview */}
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
