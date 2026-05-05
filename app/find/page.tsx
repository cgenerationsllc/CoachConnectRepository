'use client'

import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'weight-loss',
    label: 'Weight Loss',
    description: 'Find coaches who specialize in helping you lose weight and build healthy habits that last.',
    emoji: '🔥',
    color: 'from-orange-500/20 to-charcoal-800',
    border: 'border-orange-500/30',
    hover: 'hover:border-orange-500/60',
  },
  {
    id: 'weightlifting',
    label: 'Weightlifting',
    description: 'Connect with strength coaches who will help you build muscle, increase power, and perfect your form.',
    emoji: '🏋️',
    color: 'from-blue-500/20 to-charcoal-800',
    border: 'border-blue-500/30',
    hover: 'hover:border-blue-500/60',
  },
  {
    id: 'youth-sports',
    label: 'Youth Sports',
    description: 'Find coaches who develop young athletes across soccer, football, basketball, baseball, and more.',
    emoji: '⚡',
    color: 'from-green-500/20 to-charcoal-800',
    border: 'border-green-500/30',
    hover: 'hover:border-green-500/60',
  },
  {
    id: 'adult-sports',
    label: 'Adult Sports',
    description: 'Train for cycling, triathlons, pickleball, tennis, and other performance-based adult sports.',
    emoji: '🚴',
    color: 'from-purple-500/20 to-charcoal-800',
    border: 'border-purple-500/30',
    hover: 'hover:border-purple-500/60',
  },
]

export default function FindPage() {
  const router = useRouter()

  const handleSelect = (categoryId: string) => {
    router.push(`/search?category=${categoryId}`)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-28 pb-24 max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-3">
            Get started
          </p>
          <h1 className="font-display font-black text-5xl md:text-6xl mb-4">
            What are you training for?
          </h1>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Select a category and we will show you the right coaches for your goals.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`
                group text-left p-7 rounded-2xl border-2 transition-all duration-200
                bg-gradient-to-br ${cat.color} ${cat.border} ${cat.hover}
                hover:scale-[1.02] hover:shadow-2xl
                animate-fade-up
              `}
              style={{
                animationDelay: `${i * 80}ms`,
                animationFillMode: 'both',
                opacity: 0,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-4xl mb-4">{cat.emoji}</div>
                  <h2 className="font-display font-black text-2xl mb-2">{cat.label}</h2>
                  <p className="text-white/55 text-sm leading-relaxed">{cat.description}</p>
                </div>
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1
                  bg-white/5 group-hover:bg-white/15 transition-all duration-200
                  group-hover:translate-x-1
                `}>
                  <ArrowRight size={18} className="text-white/60 group-hover:text-white transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Browse all link */}
        <div className="text-center mt-10">
          <button
            onClick={() => router.push('/search')}
            className="text-white/35 hover:text-white text-sm transition-colors underline underline-offset-4"
          >
            Browse all coaches instead
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
