import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TrainerCard } from '@/components/trainer/TrainerCard'
import { HomeSearchBar } from '@/components/search/HomeSearchBar'
import { AICoachFinder } from '@/components/search/AICoachFinder'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ArrowRight, Users, Star, ShieldCheck, Zap, CheckCircle } from 'lucide-react'
import { SPORTS } from '@/types'
import type { TrainerProfile } from '@/types'

async function getFeatured(): Promise<TrainerProfile[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('trainer_profiles')
    .select('*')
    .eq('is_active', true)
    .eq('is_premium', true)
    .order('average_rating', { ascending: false })
    .limit(6)
  return data || []
}

async function getStats() {
  const supabase = createClient()
  const [{ count: coaches }, { count: reviews }] = await Promise.all([
    supabase.from('trainer_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
  ])
  return { coaches: coaches || 0, reviews: reviews || 0 }
}

const FEATURED_SPORTS = [
  { label: 'Weightlifting', href: '/search?sport=Weightlifting' },
  { label: 'Weight Loss', href: '/search?sport=Weight+Loss' },
  { label: 'Youth Sports', href: '/search?category=youth-sports' },
  { label: 'Adult Sports', href: '/search?category=adult-sports' },
]

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeatured(), getStats()])

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero-bg relative pt-32 pb-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full card text-sm text-green-400 mb-8 border border-green-500/20">
            <Zap size={13} />
            Coaches across every sport and goal — all in one place
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-6xl md:text-7xl lg:text-8xl leading-[0.95] mb-6 tracking-tight">
            Find the Right<br />
            <span className="text-green-400">Coach</span> for You
          </h1>

          <p className="text-xl text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Browse verified coaches for weight loss, strength, youth sports, athletic performance, and more. Real reviews. Clear pricing. Simple to contact.
          </p>

          <HomeSearchBar />

          <div className="flex justify-center mt-4">
            <AICoachFinder />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center flex-wrap gap-6 mt-10 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-green-400" />
              <span><strong className="text-white font-semibold">{stats.coaches}+</strong> coaches listed</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Star size={15} className="text-yellow-400" fill="currentColor" />
              <span><strong className="text-white font-semibold">{stats.reviews}+</strong> verified reviews</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-green-400" />
              <span><strong className="text-white font-semibold">Free</strong> to browse</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPORT CATEGORY PILLS ──────────────────────── */}
      <section className="border-y border-white/5 py-5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {FEATURED_SPORTS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-6 py-2 rounded-full text-sm font-medium text-white/60 border border-white/10 hover:border-green-500/40 hover:text-green-400 transition-all duration-150"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COACHES ──────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-green-400 text-xs font-semibold tracking-widest uppercase mb-2">Hand-picked</p>
              <h2 className="font-display font-bold text-4xl">Featured Coaches</h2>
            </div>
            <Link href="/search?premiumFirst=true" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-green-400 transition-colors">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((trainer, i) => (
              <div key={trainer.id} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'both', opacity: 0 }}>
                <TrainerCard trainer={trainer} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/search" className="btn-primary">
              Browse All Coaches <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-green-400 text-xs font-semibold tracking-widest uppercase mb-3">Simple process</p>
            <h2 className="font-display font-bold text-4xl">How CoachConnect Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Search & Filter', desc: 'Browse by sport, goal, city, price, experience, language, and certification. Find exactly who you need.' },
              { num: '02', title: 'Read Reviews', desc: 'Check real star ratings and client reviews. See certifications, pricing, and availability all on one profile.' },
              { num: '03', title: 'Contact & Start', desc: 'Send a direct inquiry to your coach or use their contact info to get started right away. No account needed.' },
            ].map((step) => (
              <div key={step.num} className="card p-7 relative overflow-hidden">
                <div className="font-display text-8xl font-black text-white/4 absolute -top-2 -right-2 leading-none select-none">{step.num}</div>
                <div className="relative">
                  <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-3">{step.num}</p>
                  <h3 className="font-display font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COACH CTA ─────────────────────────────────── */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="card p-10 md:p-16 text-center relative overflow-hidden" style={{ borderColor: 'rgba(34,197,94,0.25)' }}>
            <div className="absolute inset-0 hero-bg opacity-40 pointer-events-none" />
            <div className="relative">
              <h2 className="font-display font-black text-4xl md:text-5xl mb-4">Are You a Coach?</h2>
              <p className="text-xl text-white/50 mb-3 max-w-lg mx-auto">
                Get discovered by clients in your area who are actively searching for your expertise.
              </p>
              <p className="text-green-400 font-semibold mb-8">30-day free trial · No credit card required</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/auth/signup?role=trainer" className="btn-primary text-base px-8 py-4">
                  Create Your Profile — Free
                </Link>
                <Link href="/pricing" className="btn-secondary text-base px-8 py-4">
                  View Pricing
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/30">
                {['Standard from $30/month', 'Premium from $45/month', 'Cancel anytime', 'Annual plans available'].map((f) => (
                  <span key={f} className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-500" /> {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
