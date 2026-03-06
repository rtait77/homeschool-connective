import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="max-w-[780px] mx-auto px-6 py-12">
      <Link href="/tips" className="text-sm font-bold text-[#238FA4] hover:underline">← Back to Homeschool Tips</Link>
      <p className="text-sm text-[#5c5c5c] mt-6 mb-2">November 11, 2025</p>
      <h1 className="text-3xl font-extrabold mb-8">Homeschooling 101</h1>

      <div className="relative w-full h-64 mb-8 rounded-xl overflow-hidden">
        <Image src="/blog-101-banner.avif" alt="Homeschooling 101" fill className="object-cover" />
      </div>

      <h2 className="text-2xl font-extrabold text-center mb-1">How to Homeschool</h2>
      <p className="text-sm font-bold text-center uppercase tracking-widest text-[#5c5c5c] mb-8">Six Steps to Get Started</p>

      <p className="mb-8 leading-relaxed text-lg">Getting started with homeschooling can be very overwhelming! We are here to help!</p>

      <h3 className="font-extrabold text-lg mb-2">Step 1: Legal Requirements</h3>
      <p className="mb-2 leading-relaxed">Homeschooling is governed by state laws rather than federal, so it's essential to consult your state's specific regulations to understand your legal obligations for homeschooling. Some states treat homeschools as private schools and regulate accordingly, others have distinct homeschool statutes, and a few have no regulations for homeschooling whatsoever.</p>
      <p className="mb-8 leading-relaxed">You can find laws by your state here: <a href="https://hslda.org" target="_blank" rel="noopener noreferrer" className="text-[#238FA4] font-bold hover:underline">HSLDA</a> or <a href="https://homeschoolhub.com" target="_blank" rel="noopener noreferrer" className="text-[#238FA4] font-bold hover:underline">Homeschool Hub</a></p>

      <h3 className="font-extrabold text-lg mb-2">Step 2: Local Support</h3>
      <p className="mb-8 leading-relaxed">A crucial element for thriving in homeschooling is becoming part of a homeschooling community. This could be an online group on platforms like Facebook that provides encouragement and support, or a local network that offers chances for field trips, cooperative learning, classes, and social events. Local homeschoolers are a treasure trove of knowledge about homeschool regulations, and reaching out to them early can help ease the worries of those just starting out with homeschooling.</p>

      <h3 className="font-extrabold text-lg mb-2">Step 3: Homeschooling Methods</h3>
      <p className="mb-8 leading-relaxed">One of the best things about homeschooling is that you don't have to recreate school at home. You have the freedom to allow your children to learn in ways that aren't possible in an institutional setting, so learn more about what might work best for your family. There are many homeschooling methods. As you explore, consider a period of deschooling for both you and your children before diving into homeschooling, particularly if your child has been attending public school.</p>

      <h3 className="font-extrabold text-lg mb-2">Step 4: Learning Styles</h3>
      <p className="mb-8 leading-relaxed">We are all unique, which means we each have different learning styles. Kinesthetic, visual, auditory, and tactile are just some of the methods through which we learn. Our blog on <Link href="/tips/learning-styles" className="text-[#238FA4] font-bold hover:underline">Learning Styles</Link> offers in-depth insights and includes a complimentary PDF with a quiz to determine your child's learning style.</p>

      <h3 className="font-extrabold text-lg mb-2">Step 5: Learning Resources</h3>
      <p className="mb-8 leading-relaxed">With your child's learning style and your homeschooling structure in mind, it's time to explore resources. After completing steps 1–4, you can start looking into curricula that suit your family's style. You might find that a lifestyle-based learning approach is more fitting than a traditional curriculum. This is a common choice for many families. Whether you choose unschooling or let your child's interests direct their learning, remember that a curriculum isn't a necessity. When you have a shortlist of options, consult reviews from other homeschooling families who have used those resources.</p>

      <h3 className="font-extrabold text-lg mb-2">Step 6: Support Network</h3>
      <p className="mb-4 leading-relaxed">Involving key people in your life as a homeschool parent increases your chances of success and brings valuable opportunities to your family. Engaging grandparents, in particular, can be beneficial once they understand the advantages of homeschooling.</p>
      <p className="mb-8 leading-relaxed">However, your support network isn't limited to grandparents. The important people in your life — your "village" — can share their strengths when you involve them in your homeschooling journey. For instance, a sibling with a math degree might tutor algebra, or a friend in media might arrange a workplace tour. While respecting boundaries is crucial, you may discover that your village is eager to enhance your children's learning experiences.</p>

      <div className="bg-[#f5f1e9] rounded-xl p-6 mb-8">
        <p className="leading-relaxed">As you take these steps, embrace the flexibility and freedom that homeschooling provides. Celebrate the small victories and learn from the challenges, knowing that each day brings new opportunities for growth and discovery. Happy homeschooling!</p>
      </div>

      <div className="relative w-full h-40 rounded-xl overflow-hidden">
        <Image src="/blog-thanks.avif" alt="Thanks for reading" fill className="object-cover" />
      </div>

      <div className="mt-10 pt-8 border-t border-[#ddd8cc]">
        <div className="sender-form-field" data-sender-form-id="bkR0lK"></div>
      </div>
    </div>
  )
}
