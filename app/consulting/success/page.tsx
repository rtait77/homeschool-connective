import Link from 'next/link'

export default function ConsultingSuccessPage() {
  return (
    <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h1 className="text-3xl font-extrabold mb-4">Welcome! Mel can't wait to help your family.</h1>
      <p className="text-[#5c5c5c] mb-3">Check your email — Mel's welcome message with your intake form and quiz is on its way.</p>
      <p className="text-[#5c5c5c] mb-8">If you don't see it within a few minutes, check your spam folder.</p>
      <Link href="/" className="inline-block bg-[#ed7c5a] text-white font-bold px-8 py-3 rounded-lg hover:opacity-90 transition">
        Back to Home
      </Link>
    </div>
  )
}
