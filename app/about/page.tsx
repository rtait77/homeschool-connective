import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-14">

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-2">About</h1>
      </div>

      <div className="space-y-5 text-[#1c1c1c] leading-relaxed mb-12">
        <p>Homeschooling is a beautiful and rewarding experience for kids and home educators, but it can also come with challenges, self-doubt, and moments of loneliness. We understand these feelings because we've experienced them too.</p>
        <p>We are two homeschool moms who've had our fair share of difficulties, especially when it comes to finding the "right" curriculum (I can't tell you how many we've tried 🙈). Not only have we "tried them all" but we've also spent years creating different types of educational resources to fit our needs.</p>
        <p>One thing has always had a good outcome for us — games! Therefore, we have turned our focus to creating interactive, gamified content for Grades 3–6 as well as games for Pre-K–2.</p>
        <p>In May 2024, we officially formed an LLC, solidifying our commitment to helping homeschooling families thrive.</p>
        <p className="font-bold">
          Mel &amp; Bec<br />
          Co-Founders<br />
          Homeschool Connective, LLC
        </p>
      </div>

      {/* Rebecca */}
      <div className="flex flex-col md:flex-row gap-6 mb-10 p-6 bg-white rounded-[14px]" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
        <div className="flex-shrink-0">
          <Image src="/rebecca.png" alt="Rebecca Tait" width={140} height={140} className="rounded-full object-cover w-[140px] h-[140px]" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg mb-3">Rebecca Tait | Founder and Chief Executive Manager</h3>
          <p className="text-[#5c5c5c] text-sm leading-relaxed mb-2">Rebecca has been homeschooling for over 10 years and has spent much of that time building hands-on, creative learning experiences for kids. She holds a bachelor's degree in business and she co-founded Homeschool Connective where she develops interactive online courses and gamified curriculum for homeschoolers. Her goal is to create fun, engaging ways for kids to learn complex topics.</p>
          <p className="text-[#5c5c5c] text-sm leading-relaxed">Rebecca teaches at a microschool for homeschoolers, and she also serves on Parent Council as the school's Clubs Coordinator. She also co-leads after school clubs.</p>
        </div>
      </div>

      {/* Melanie */}
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-[14px]" style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
        <div className="flex-shrink-0">
          <Image src="/melanie.avif" alt="Melanie Miller" width={140} height={140} className="rounded-full object-cover w-[140px] h-[140px]" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg mb-3">Melanie Miller | Founder and Chief Marketing Manager</h3>
          <p className="text-[#5c5c5c] text-sm leading-relaxed">Melanie has been homeschooling for over 20 years. Now that her children are grown, she homeschools her grandchildren. She has experience teaching and loves to create teacher resources and curriculum for a variety of ages.</p>
        </div>
      </div>

    </div>
  )
}
