'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CheckCircle, Star, Zap } from 'lucide-react'
import { PLANS } from '@/lib/stripe'

export default function PricingPage() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="hero-bg pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-3">Simple pricing</p>
            <h1 className="font-display font-black text-5xl md:text-6xl mb-4">Grow Your Coaching Business</h1>
            <p className="text-xl text-white/45 max-w-xl mx-auto mb-8">
              Get discovered by clients actively searching for your expertise. Start completely free for 30 days.
            </p>

            {/* Monthly / Yearly toggle */}
            <div className="inline-flex items-center gap-1 p-1 card rounded-2xl">
              <button
                onClick={() => setInterval('monthly')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${interval === 'monthly' ? 'bg-green-500 text-white' : 'text-white/50 hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval('yearly')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${interval === 'yearly' ? 'bg-green-500 text-white' : 'text-white/50 hover:text-white'}`}
              >
                Yearly
                <span className="text-xs bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded-full">Save up to $90</span>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">

            {/* Standard */}
            <div className="card p-8 border border-white/8">
              <h2 className="font-display font-bold text-2xl mb-1">Standard</h2>
              <p className="text-white/40 text-sm mb-6">Everything you need to get found and build your client base.</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-5xl font-black">
                  ${interval === 'monthly' ? PLANS.standard.monthly.price : PLANS.standard.yearly.price}
                </span>
                <span className="text-white/35">/{interval === 'monthly' ? 'month' : 'year'}</span>
              </div>
              {interval === 'yearly' && <p className="text-green-400 text-sm mb-1">You save $60 vs monthly</p>}
              <p className="text-green-400 text-sm mb-8">30-day free trial · No card needed</p>
              <ul className="space-y-3 mb-8">
                {PLANS.standard.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                    <CheckCircle size={15} className="text-green-400 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link href={`/auth/signup?role=trainer`} className="btn-secondary block text-center w-full py-3.5">
                Start Free Trial
              </Link>
            </div>

            {/* Premium */}
            <div className="card p-8 border-2 border-green-500/40 relative" style={{ background: 'linear-gradient(145deg, rgba(34,197,94,0.1) 0%, rgba(36,36,36,0.95) 60%)' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 badge-premium px-4 py-1.5">
                <Star size={12} fill="currentColor" /> Most Popular
              </div>
              <h2 className="font-display font-bold text-2xl mb-1">Premium</h2>
              <p className="text-white/40 text-sm mb-6">Maximum visibility for coaches serious about growing their business.</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-5xl font-black">
                  ${interval === 'monthly' ? PLANS.premium.monthly.price : PLANS.premium.yearly.price}
                </span>
                <span className="text-white/35">/{interval === 'monthly' ? 'month' : 'year'}</span>
              </div>
              {interval === 'yearly' && <p className="text-green-400 text-sm mb-1">You save $90 vs monthly</p>}
              <p className="text-green-400 text-sm mb-8">30-day free trial · No card needed</p>
              <ul className="space-y-3 mb-8">
                {PLANS.premium.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                    <CheckCircle size={15} className="text-green-400 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link href={`/auth/signup?role=trainer`} className="btn-primary block text-center w-full py-3.5">
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Founding offer callout */}
          <div className="max-w-3xl mx-auto card p-6 border border-amber-500/25 mb-16" style={{ background: 'rgba(245,158,11,0.05)' }}>
            <div className="flex items-start gap-4">
              <Zap size={22} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1 text-amber-300">Founding Coach Offer</h3>
                <p className="text-white/55 text-sm leading-relaxed">
                  The first 50 coaches to join CoachConnect receive 50% off for their first 6 months using a personal promo code.
                  Contact us at <a href="mailto:cgenerationsllc@gmail.com" className="text-amber-400 hover:underline">cgenerationsllc@gmail.com</a> to claim your spot, or enter your code on the billing page after signup.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-3xl text-center mb-10">Common Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Do I need a credit card to start?', a: 'No. Your 30-day free trial begins immediately with just your email and a password. You only add payment details when you\'re ready to continue after the trial.' },
                { q: 'What happens when my trial ends?', a: 'Your profile will go inactive. You\'ll receive email reminders before the trial ends and can activate your listing with one click from your dashboard at any time.' },
                { q: 'If I cancel, does my profile go dark right away?', a: 'No — your profile stays live until the end of your current billing period. You\'ve paid for that time and you keep it.' },
                { q: 'Can I switch between monthly and yearly?', a: 'Yes. You can switch any time from your billing dashboard. Stripe handles the proration automatically.' },
                { q: 'Can I upgrade from Standard to Premium?', a: 'Yes — upgrade any time from your dashboard. You only pay the difference for the rest of your billing period.' },
                { q: 'What does "first in search results" mean for Premium?', a: 'Premium coaches appear at the top of search results within whatever sort order the user has chosen — highest rated, newest, by price, etc. They still sort correctly within their group, just ahead of Standard listings.' },
                { q: 'What is the annual renewal notice?', a: 'If you\'re on a yearly plan, we send you an email reminder 15 days before your renewal date so you\'re never surprised.' },
              ].map(({ q, a }) => (
                <div key={q} className="card p-5">
                  <h3 className="font-semibold mb-2 flex items-start gap-2 text-sm">
                    <Zap size={15} className="text-green-400 mt-0.5 shrink-0" /> {q}
                  </h3>
                  <p className="text-white/45 text-sm leading-relaxed pl-5">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
