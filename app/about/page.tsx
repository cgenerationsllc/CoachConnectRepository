import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About CoachConnect' }

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="hero-bg pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-3">Our story</p>
          <h1 className="font-display font-black text-5xl mb-6">Built for coaches. Built for clients.</h1>
          <div className="space-y-5 text-white/60 leading-relaxed text-base">
            <p>
              CoachConnect was built on one simple idea: finding the right coach should be as easy as finding a restaurant. You should be able to search, compare, read real reviews, see exactly what someone charges, and reach out — all in one place.
            </p>
            <p>
              Right now that process is scattered. Coaches market themselves on Instagram, rely on word of mouth, or get buried in general directories built for plumbers and accountants. Clients have no reliable way to compare coaches, verify credentials, or read real feedback from people who have actually trained with them.
            </p>
            <p>
              CoachConnect fixes that. We built a marketplace specifically for personal training and coaching — across every sport, every fitness goal, and every experience level. Whether you're a beginner trying to lose weight, a competitive athlete chasing a personal record, or a parent looking for a youth sports coach, you'll find the right match here.
            </p>
            <p>
              For coaches, we built something even simpler: one profile, one subscription, and a steady stream of clients who are actively looking for exactly what you offer.
            </p>
            <p>
              We're based in Texas and focused on building the most trusted fitness coaching platform in the country, one city at a time — starting in Austin.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link href="/search" className="btn-primary">Find a Coach</Link>
            <Link href="/auth/signup?role=trainer" className="btn-secondary">List Your Profile</Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
