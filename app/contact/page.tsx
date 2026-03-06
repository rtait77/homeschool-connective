'use client'

export default function ContactPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold mb-2">Contact Us</h1>
      <p className="text-[#5c5c5c] mb-10">We'd love to hear from you! Send us a message and we'll get back to you soon.</p>

      <form action="https://api.web3forms.com/submit" method="POST" className="space-y-5">
        <input type="hidden" name="access_key" value="e9fa8d0f-0004-4b87-bdf7-5403329c59cb" />
        <input type="hidden" name="redirect" value="https://www.homeschoolconnective.com/contact-thanks.html" />

        <div>
          <label className="block font-bold text-sm mb-1" htmlFor="name">Name</label>
          <input
            id="name" name="name" type="text" placeholder="Your name" required
            className="w-full border border-[#ddd8cc] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#55b6ca]"
          />
        </div>

        <div>
          <label className="block font-bold text-sm mb-1" htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email" placeholder="your@email.com" required
            className="w-full border border-[#ddd8cc] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#55b6ca]"
          />
        </div>

        <div>
          <label className="block font-bold text-sm mb-1" htmlFor="subject">Subject</label>
          <input
            id="subject" name="subject" type="text" placeholder="What's this about?"
            className="w-full border border-[#ddd8cc] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#55b6ca]"
          />
        </div>

        <div>
          <label className="block font-bold text-sm mb-1" htmlFor="message">Message</label>
          <textarea
            id="message" name="message" rows={6} placeholder="Write your message here..."
            className="w-full border border-[#ddd8cc] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#55b6ca] resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full font-bold text-sm px-6 py-3 rounded-lg bg-[#ed7c5a] text-white border-2 border-[#ed7c5a] hover:bg-white hover:text-[#ed7c5a] transition-all"
        >
          Send Message
        </button>
      </form>
    </div>
  )
}
