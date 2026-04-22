import { createClient } from '@/lib/supabase/server'
import { TrainerCard } from '@/components/trainer/TrainerCard'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { SPORTS } from '@/types'
import type { TrainerProfile } from '@/types'
import type { Metadata } from 'next'

interface Props {
  params: { sport: string }
}

function slugToSport(slug: string): string | null {
  const decoded = slug.replace(/-/g, ' ').toLowerCase()
  return SPORTS.find((s) => s.toLowerCase() === decoded) || null
}

export async function generateStaticParams() {
  return SPORTS.map((sport) => ({
    sport: sport.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sport = slugToSport(params.sport)
  if (!sport) return { title: 'Coaches — CoachConnect' }
  return {
    title: `${sport} Coaches — CoachConnect`,
    description: `Find verified ${sport.toLowerCase()} coaches on CoachConnect. Browse profiles, read real reviews, and contact coaches for free.`,
  }
}

export default async function SportPage({ params }: Props) {
  const sport = slugToSport(params.sport)
  if (!sport) return <div>Page not found</div>

  const supabase = createClient()
  const { data: trainers } = await supabase
    .from('trainer_profiles')
    .select('*')
    .eq('is_active', true)
    .contains('sports', [sport])
    .order('is_premium', { ascending: false })
    .order('average_rating', { ascending: false })
    .limit(24)

  const results = (trainers || []) as TrainerProfile[]

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 max-w-6xl mx-auto px-4">
        <div className="mb-10">
          <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-3">CoachConnect</p>
          <h1 className="font-display font-black text-5xl mb-3">{sport} Coaches</h1>
          <p className="text-white/45 mb-6">
            {results.length > 0 ? results.length : 'Browse'} verified {sport.toLowerCase()} coaches. Real reviews, clear pricing, easy contact.
          </p>
          <Link href={`/search?sport=${encodeURIComponent(sport)}`} className="btn-secondary text-sm py-2 px-4">
            Filter by location →
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-white/40 mb-4">No {sport.toLowerCase()} coaches listed yet.</p>
            <Link href="/search" className="btn-primary">Browse all coaches</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        )}

        {/* Other sports */}
        <div className="mt-16">
          <h2 className="font-display font-bold text-2xl mb-5">Browse Other Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {SPORTS.filter((s) => s !== sport).map((s) => (
              <Link
                key={s}
                href={`/sports/${s.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="px-4 py-2 rounded-xl card text-sm text-white/55 hover:text-green-400 transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
