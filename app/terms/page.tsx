import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service — CoachConnect' }

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 max-w-3xl mx-auto px-4">
        <h1 className="font-display font-black text-5xl mb-3">Terms of Service</h1>
        <p className="text-white/35 text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · <strong className="text-amber-400">Placeholder — have a lawyer review before going live</strong></p>
        <div className="space-y-8 text-white/60 leading-relaxed text-sm">
          {[
            { title: '1. Acceptance of Terms', body: 'By accessing or using CoachConnect ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.' },
            { title: '2. Platform Description', body: 'CoachConnect is a marketplace that connects personal coaches and fitness professionals ("Coaches") with individuals seeking coaching services ("Clients"). CoachConnect does not employ coaches and is not responsible for the services they provide.' },
            { title: '3. Coach Listings', body: 'Coaches pay a monthly or annual subscription fee to maintain an active listing on the Platform. Subscriptions begin with a 30-day free trial. Coaches are responsible for the accuracy of all information in their profiles, including certifications, pricing, and availability.' },
            { title: '4. User Conduct', body: 'Users agree not to submit false reviews, misrepresent themselves, harass coaches or other users, or use the Platform for any unlawful purpose. CoachConnect reserves the right to suspend or remove any account that violates these terms.' },
            { title: '5. Reviews', body: 'Reviews must be based on genuine firsthand experience. Only users who have contacted a coach through CoachConnect may leave a review for that coach. CoachConnect reserves the right to remove reviews that violate our community guidelines.' },
            { title: '6. Payments', body: 'Coach subscriptions are processed through Stripe. CoachConnect does not store payment card information. Subscription fees are non-refundable except where required by law. Cancelled subscriptions remain active until the end of the paid billing period.' },
            { title: '7. Limitation of Liability', body: 'CoachConnect is a directory and connection platform only. We make no guarantees about the quality, safety, or results of any coaching services. Users engage coaches at their own risk. CoachConnect\'s liability is limited to the amount paid for platform subscriptions.' },
            { title: '8. Privacy', body: 'Your use of the Platform is governed by our Privacy Policy. By using CoachConnect you consent to the collection and use of your information as described therein.' },
            { title: '9. Changes to Terms', body: 'CoachConnect reserves the right to modify these terms at any time. Continued use of the Platform following notice of changes constitutes acceptance of those changes.' },
            { title: '10. Contact', body: 'For questions about these Terms, contact us at cgenerationsllc@gmail.com.' },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-display font-bold text-lg text-white mb-2">{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
