import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy — CoachConnect' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 max-w-3xl mx-auto px-4">
        <h1 className="font-display font-black text-5xl mb-3">Privacy Policy</h1>
        <p className="text-white/35 text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · <strong className="text-amber-400">Placeholder — have a lawyer review before going live</strong></p>
        <div className="space-y-8 text-white/60 leading-relaxed text-sm">
          {[
            { title: '1. Information We Collect', body: 'We collect information you provide when creating an account (name, email, password), building a coach profile (bio, location, rates, certifications, photos), or sending inquiries. We also collect usage data such as profile views and search activity.' },
            { title: '2. How We Use Your Information', body: 'We use your information to operate the Platform, match clients with coaches, send email notifications (inquiry alerts, subscription reminders, weekly stats), process payments through Stripe, and improve Platform functionality.' },
            { title: '3. Information Sharing', body: 'Coach profiles are publicly visible on the Platform. We do not sell personal data to third parties. We share data with service providers (Supabase for database, Stripe for payments, Resend for email) only as necessary to operate the Platform.' },
            { title: '4. Data Security', body: 'We use industry-standard security measures including encrypted connections, secure database access controls, and role-based permissions. Payment card data is processed entirely by Stripe and never stored on our servers.' },
            { title: '5. Cookies', body: 'We use cookies to maintain your login session and remember your preferences. We do not use tracking cookies for advertising purposes.' },
            { title: '6. Data Retention', body: 'We retain your account data for as long as your account is active. Coaches who cancel their subscription retain their profile data in our system. You may request deletion of your account and data by contacting us.' },
            { title: '7. Your Rights', body: 'You have the right to access, correct, or delete your personal data. To make a request, contact us at cgenerationsllc@gmail.com. We will respond within 30 days.' },
            { title: '8. Children\'s Privacy', body: 'CoachConnect is not directed at children under 13. We do not knowingly collect personal information from children under 13.' },
            { title: '9. Changes to This Policy', body: 'We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email.' },
            { title: '10. Contact', body: 'For privacy questions or data requests, contact cgenerationsllc@gmail.com.' },
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
