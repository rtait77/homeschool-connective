export default function PrivacyPage() {
  return (
    <div className="max-w-[760px] mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold mb-2">Privacy Policy</h1>
      <p className="text-sm text-[#5c5c5c] mb-10">Last updated: March 10, 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-[#1c1c1c]">

        <section>
          <p>Homeschool Connective, LLC ("we", "us", or "our") operates homeschoolconnective.com. This policy explains what information we collect, how we use it, and your rights.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">What we collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-[#3c3c3c]">
            <li><strong>Account information</strong> — your email address and password when you sign up.</li>
            <li><strong>Payment information</strong> — processed securely by Stripe. We never see or store your credit card number.</li>
            <li><strong>Usage data</strong> — which games you play, how long you play, and whether you complete them. This helps us improve the site.</li>
            <li><strong>Favorites</strong> — games you save as favorites.</li>
            <li><strong>Newsletter subscription</strong> — your email if you subscribe to our newsletter (managed by Sender.net).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">How we use your information</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-[#3c3c3c]">
            <li>To provide and manage your account and subscription.</li>
            <li>To send transactional emails (trial reminders, payment confirmations).</li>
            <li>To send our newsletter, if you subscribed.</li>
            <li>To understand how games are used so we can improve them.</li>
            <li>To respond to your questions or support requests.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">How we share your information</h2>
          <p className="text-sm text-[#3c3c3c]">We do not sell your personal information. We share data only with the third-party services that power this site:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-[#3c3c3c] mt-2">
            <li><strong>Supabase</strong> — our database and authentication provider.</li>
            <li><strong>Stripe</strong> — payment processing.</li>
            <li><strong>Sender.net</strong> — email delivery.</li>
            <li><strong>Vercel</strong> — website hosting.</li>
          </ul>
          <p className="text-sm text-[#3c3c3c] mt-2">Each of these services has their own privacy policy and handles your data securely.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Cookies</h2>
          <p className="text-sm text-[#3c3c3c]">We use cookies only to keep you logged in to your account. We do not use advertising or tracking cookies.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Children's privacy</h2>
          <p className="text-sm text-[#3c3c3c]">Our service is intended for parents and educators, not children. Accounts must be created by an adult. We do not knowingly collect personal information from children under 13.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Your rights</h2>
          <p className="text-sm text-[#3c3c3c]">You can request to access, correct, or delete your personal data at any time by emailing us at <a href="mailto:support@homeschoolconnective.com" className="text-[#ed7c5a] hover:underline">support@homeschoolconnective.com</a>. We'll respond within 30 days.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Data retention</h2>
          <p className="text-sm text-[#3c3c3c]">We keep your account data for as long as your account is active. If you delete your account, we remove your personal data within 30 days.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Changes to this policy</h2>
          <p className="text-sm text-[#3c3c3c]">If we make significant changes, we'll update the date at the top of this page. Continued use of the site after changes means you accept the updated policy.</p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold mb-2">Contact us</h2>
          <p className="text-sm text-[#3c3c3c]">Questions? Email us at <a href="mailto:support@homeschoolconnective.com" className="text-[#ed7c5a] hover:underline">support@homeschoolconnective.com</a>.</p>
        </section>

      </div>
    </div>
  )
}
