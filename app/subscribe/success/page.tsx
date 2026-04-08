import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h1 className="text-3xl font-extrabold mb-4">You're subscribed!</h1>
      <p className="text-[#5c5c5c] mb-8">Welcome to Homeschool Connective. You now have full access to all games and resources.</p>
      <Link href="/learn" className="inline-block bg-[#ed7c5a] text-white font-bold px-8 py-3 rounded-lg hover:opacity-90 transition">
        Start Learning →
      </Link>
    </div>
  )
}
