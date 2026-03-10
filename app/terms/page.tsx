export default function TermsPage() {
  return (
    <div className="max-w-[760px] mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold mb-2">Terms of Service</h1>
      <p className="text-sm text-[#5c5c5c] mb-10">Last updated: March 10, 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-[#1c1c1c]">

        <section>
          <p>These Terms of Service govern your use of homeschoolconnective.com, operated by Homeschool Connective, LLC. By creating an account or using the site, you agree to these terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Who can use this site</h2>
          <p className="text-sm text-[#3c3c3c]">You must be at least 18 years old to create an account. Our content is designed for use with children, but accounts must be held by an adult (parent, guardian, or educator).</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Free trial</h2>
          <p className="text-sm text-[#3c3c3c]">New accounts receive a 7-day free trial with full access to all games and lessons. No credit card is required to start a trial. At the end of your trial, access will be restricted unless you subscribe.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Subscriptions and billing</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-[#3c3c3c]">
            <li>Subscriptions are available monthly ($5/month) or yearly ($50/year).</li>
            <li>Billing is handled securely by Stripe and renews automatically.</li>
            <li>You can cancel your subscription at any time. Cancellation takes effect at the end of your current billing period — you keep access until then.</li>
            <li>We do not offer refunds for partial billing periods, but if you have an issue please contact us and we'll do our best to help.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">What you get</h2>
          <p className="text-sm text-[#3c3c3c]">An active subscription gives you access to all games and lessons on the site for personal, non-commercial use. This means you can use the content to educate your own children or students.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">What you may not do</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-[#3c3c3c]">
            <li>Share your account login with people outside your household.</li>
            <li>Reproduce, redistribute, or resell our games or content.</li>
            <li>Use the site for any commercial purpose without our written permission.</li>
            <li>Attempt to bypass the paywall or access restricted content without a valid subscription.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Our content</h2>
          <p className="text-sm text-[#3c3c3c]">All games, lessons, and educational content on this site are owned by Homeschool Connective, LLC unless otherwise credited.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Availability</h2>
          <p className="text-sm text-[#3c3c3c]">We do our best to keep the site running smoothly, but we cannot guarantee uninterrupted access. We may update, add, or remove content at any time. We will not remove major content categories without reasonable notice.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Limitation of liability</h2>
          <p className="text-sm text-[#3c3c3c]">Homeschool Connective, LLC is not liable for any indirect, incidental, or consequential damages arising from your use of the site. Our total liability to you will not exceed the amount you paid us in the last 12 months.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Termination</h2>
          <p className="text-sm text-[#3c3c3c]">We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting us.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Governing law</h2>
          <p className="text-sm text-[#3c3c3c]">These terms are governed by the laws of the State of North Carolina, USA.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Changes to these terms</h2>
          <p className="text-sm text-[#3c3c3c]">We may update these terms from time to time. We'll update the date at the top of this page when we do. Continued use of the site after changes means you accept the updated terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Contact us</h2>
          <p className="text-sm text-[#3c3c3c]">Questions about these terms? Email us at <a href="mailto:support@homeschoolconnective.com" className="text-[#ed7c5a] hover:underline">support@homeschoolconnective.com</a>.</p>
        </section>

      </div>
    </div>
  )
}
