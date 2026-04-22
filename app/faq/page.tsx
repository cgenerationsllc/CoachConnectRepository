import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'FAQ — CoachConnect' }

const USER_FAQS = [
  { q: 'Is it free to browse coaches?', a: 'Yes, completely free. You can search, filter, read profiles, and read reviews without creating an account.' },
  { q: 'Do I need an account to contact a coach?', a: 'No. You can fill in the contact form directly on a coach\'s profile page without signing up.' },
  { q: 'How do I know the reviews are real?', a: 'Reviews on CoachConnect can only be left by users who have sent an inquiry to that specific coach through our platform. Each verified review shows a "Verified" badge.' },
  { q: 'Can I save coaches I\'m interested in?', a: 'Yes — create a free account and you can bookmark coaches to compare later.' },
  { q: 'What if I have a problem with a coach?', a: 'Use the "Report" button on the coach\'s profile page. Select a reason, add any details, and our team will review it within 48 hours.' },
  { q: 'How do I leave a review?', a: 'You need a CoachConnect account and you must have previously contacted that coach through our platform. Go to the coach\'s profile and scroll to the review section.' },
  { q: 'Are the coaches certified?', a: 'Many are — look for the green "Certified" badge on the profile. Coaches self-report their certifications, and we encourage users to ask coaches for proof directly.' },
]

const TRAINER_FAQS = [
  { q: 'How does the free trial work?', a: '30 days completely free. No credit card required to start. You build your profile, it goes live, and clients can find and contact you immediately. At the end of 30 days you choose a plan to continue.' },
  { q: 'What happens if I don\'t subscribe after the trial?', a: 'Your profile goes inactive — it won\'t appear in search results. Your data stays saved. You can reactivate any time by choosing a plan from your dashboard.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your billing dashboard at any time with no cancellation fees. Your profile stays live until the end of your current paid period.' },
  { q: 'What\'s the difference between Standard and Premium?', a: 'Standard gets you a full profile in search results with all core features. Premium adds homepage featuring, first placement in search results (within whatever sort the user chose), a one-sentence bio on your search card, and a Premium badge.' },
  { q: 'Do you offer annual billing?', a: 'Yes. Standard is $300/year (save $60). Premium is $450/year (save $90). You get a 15-day notice before annual renewal.' },
  { q: 'Is there a promo for early coaches?', a: 'Yes — the first 50 coaches to join receive 50% off for 6 months. Contact us at cgenerationsllc@gmail.com to request your promo code.' },
  { q: 'Do I need to be certified to list?', a: 'No certification is required, but it is highly recommended. Certified coaches receive a green "Certified" badge on their profile and search card, which significantly improves client trust.' },
  { q: 'How do clients contact me?', a: 'Clients fill in a contact form on your profile. You get an email notification instantly. You must provide at least one contact method — email or phone — for clients to reach you directly.' },
  { q: 'Can I respond to reviews?', a: 'Yes — you can post one response per review. This is your opportunity to address feedback professionally and show potential clients how you handle criticism.' },
]

export default function FAQPage({
  searchParams,
}: {
  searchParams: { for?: string }
}) {
  const forTrainers = searchParams.for === 'trainers'

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 max-w-3xl mx-auto px-4">
        <div className="mb-10">
          <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-3">Got questions?</p>
          <h1 className="font-display font-black text-5xl mb-6">Frequently Asked Questions</h1>

          {/* Tabs */}
          <div className="flex gap-2">
            <a href="/faq" className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${!forTrainers ? 'bg-green-500 text-white' : 'card text-white/50 hover:text-white'}`}>
              For Clients
            </a>
            <a href="/faq?for=trainers" className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${forTrainers ? 'bg-green-500 text-white' : 'card text-white/50 hover:text-white'}`}>
              For Coaches
            </a>
          </div>
        </div>

        <div className="space-y-4">
          {(forTrainers ? TRAINER_FAQS : USER_FAQS).map(({ q, a }) => (
            <div key={q} className="card p-6">
              <h3 className="font-semibold mb-2 text-white">{q}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 mt-8 border border-green-500/15 text-center">
          <p className="text-white/50 text-sm mb-2">Still have a question?</p>
          <a href="mailto:cgenerationsllc@gmail.com" className="text-green-400 hover:underline font-semibold">cgenerationsllc@gmail.com</a>
        </div>
      </div>
      <Footer />
    </div>
  )
}
