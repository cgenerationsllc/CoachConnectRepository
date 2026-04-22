import { createClient } from '@/lib/supabase/server'
import { TrainerCard } from '@/components/trainer/TrainerCard'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { TOP_CITIES } from '@/types'
import type { TrainerProfile } from '@/types'
import type { Metadata } from 'next'

interface Props {
  params: { city: string }
}

function parseSlug(slug: string): { city: string; state: string } | null {
  const match = slug.match(/^personal-trainers-(.+)-([a-z]{2})$/)
  if (!match) return null
  return {
    city: match[1].split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    state: match[2].toUpperCase(),
  }
}

export async function generateStaticParams() {
  return TOP_CITIES.map(({ city, state }) => ({
    city: `personal-trainers-${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsed = parseSlug(params.city)
  if (!parsed) return { title: 'Personal Trainers — CoachConnect' }
  return {
    title: `Personal Trainers in ${parsed.city}, ${parsed.state} — CoachConnect`,
    description: `Find verified personal trainers and fitness coaches in ${parsed.city}, ${parsed.state}. Browse profiles, read reviews, and contact coaches for free on CoachConnect.`,
  }
}

export default async function CityPage({ params }: Props) {
  const parsed = parseSlug(params.city)
  if (!parsed) return <div>Page not found</div>

  const supabase = createClient()
  const { data: trainers } = await supabase
    .from('trainer_profiles')
    .select('*')
    .eq('is_active', true)
    .ilike('city', `%${parsed.city}%`)
    .eq('state', parsed.state)
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
          <h1 className="font-display font-black text-5xl mb-3">
            Personal Trainers in {parsed.city}, {parsed.state}
          </h1>
          <p className="text-white/45 mb-6">
            Browse {results.length > 0 ? results.length : 'verified'} personal trainers and fitness coaches in {parsed.city}. Real reviews, clear pricing, and easy contact.
          </p>
          <Link href={`/search?city=${encodeURIComponent(parsed.city)}&state=${parsed.state}`} className="btn-secondary text-sm py-2 px-4">
            View all filters →
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-white/40 mb-4">No coaches listed in {parsed.city} yet.</p>
            <Link href="/search" className="btn-primary">Browse all coaches</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        )}

        {/* Other cities */}
        <div className="mt-16">
          <h2 className="font-display font-bold text-2xl mb-5">Browse Other Cities</h2>
          <div className="flex flex-wrap gap-3">
            {TOP_CITIES.filter((c) => !(c.city === parsed.city && c.state === parsed.state)).map(({ city, state }) => (
              <Link
                key={`${city}-${state}`}
                href={`/cities/personal-trainers-${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`}
                className="px-4 py-2 rounded-xl card text-sm text-white/55 hover:text-green-400 transition-colors"
              >
                {city}, {state}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
