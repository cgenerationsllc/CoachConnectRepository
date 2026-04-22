import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog — CoachConnect' }

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 text-center">
        <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-3">Coming soon</p>
        <h1 className="font-display font-black text-5xl mb-4">The CoachConnect Blog</h1>
        <p className="text-white/45 max-w-xl mx-auto">
          Fitness tips, coach spotlights, training guides, and advice for finding the right coach. Coming soon.
        </p>
      </div>
      <Footer />
    </div>
  )
}
