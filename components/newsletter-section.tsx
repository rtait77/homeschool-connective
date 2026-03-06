'use client'

import { useEffect } from 'react'

export default function NewsletterSection() {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).sender) {
      (window as any).sender('7c20d4cb647923')
    }
  }, [])

  return (
    <section className="bg-[#3d3d3d] py-14 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="sender-form-field" data-sender-form-id="bkR0lK"></div>
      </div>
    </section>
  )
}
