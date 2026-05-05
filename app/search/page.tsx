import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { TrainerCard } from '@/components/trainer/TrainerCard'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { TrainerProfile } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Find a Coach' }

const CATEGORY_LABELS: Record<string, string> = {
  'weightlifting': 'Weightlifting Coaches',
  'weight-loss': 'Weight Loss Coaches',
  'youth-sports': 'Youth Sports Coaches',
  'adult-sports': 'Adult Sports Coaches',
}

const YOUTH_SPORT_LIST = [
  'Youth Soccer', 'Youth Football', 'Youth Baseball',
  'Youth Basketball', 'Youth Wrestling', 'Youth Track & Field',
  'Youth Swimming', 'Youth Gymnastics',
]

const ADULT_SPORT_LIST = [
  'Cycling', 'Ironman & Triathlon', 'Pickleball', 'Tennis',
  'Golf', 'Rock Climbing', 'Marathon & Endurance Running',
  'Swimming', 'Rowing',
]

async function getTrainers(sp: Record<string, string | undefined>) {
  const supabase = createClient()

  let query = supabase
    .from('trainer_profiles')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  // Category filtering
  if (sp.category === 'weightlifting') {
    query = query.contains('sports', ['Weightlifting'])
  } else if (sp.category === 'weight-loss') {
    query = query.contains('sports', ['Weight Loss'])
  } else if (sp.category === 'youth-sports') {
    if (sp.sport) {
      query = query.contains('sports', [sp.sport])
    } else {
      query = query.or(
        YOUTH_SPORT_LIST.map(s => `sports.cs.{"${s}"}`).join(',')
      )
    }
  } else if (sp.category === 'adult-sports') {
    if (sp.sport) {
      query = query.contains('sports', [sp.sport])
    } else {
      query = query.or(
        ADULT_SPORT_LIST.map(s => `sports.cs.{"${s}"}`).join(',')
      )
    }
  } else if (sp.sport) {
    query = query.contains('sports', [sp.sport])
  }

  // Additional filters
  if (sp.q) {
    query = query.or(`display_name.ilike.%${sp.q}%,bio.ilike.%${sp.q}%`)
  }
  if (sp.city) query = query.ilike('city', `%${sp.city}%`)
  if (sp.state) query = query.eq('state', sp.state)
  if (sp.remote === 'true') query = query.eq('remote_available', true)
  if (sp.certified === 'true') query = query.eq('is_certified', true)
  if (sp.gender) query = query.eq('gender', sp.gender)
  if (sp.language) query = query.contains('languages', [sp.language])
  if (sp.minExperience) query = query.gte('years_experience', parseInt(sp.minExperience))
  if (sp.minRating) query = query.gte('average_rating', parseFloat(sp.minRating))

  // Sorting — premium always first within sort
  const sort = sp.sortBy || 'rating'
  if (sort === 'rating') {
    query = query.order('is_premium', { ascending: false }).order('average_rating', { ascending: false })
  } else if (sort === 'most_reviewed') {
    query = query.order('is_premium', { ascending: false }).order('review_count', { ascending: false })
  } else if (sort === 'newest') {
    query = query.order('is_premium', { ascending: false }).order('created_at', { ascending: false })
  }

  query = query.limit(24)

  const { data, count } = await query
  return { trainers: (data || []) as TrainerProfile[], total: count || 0 }
}

interface Props {
  searchParams: Record<string, string | undefined>
}

export default async function SearchPage({ searchParams }: Props) {
  const { trainers, total } = await getTrainers(searchParams)

  const categoryLabel = searchParams.category
    ? CATEGORY_LABELS[searchParams.category]
    : null

  const title = categoryLabel
    || (searchParams.sport ? `${searchParams.sport} Coaches` : 'All Coaches')

  const hasCategory = !!searchParams.category
  const hasAnyFilter = Object.keys(searchParams).length > 0

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">

          {/* Back button */}
          <Link
            href="/find"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={15} /> Back to categories
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-bold text-4xl">{title}</h1>
              <p className="text-white/40 text-sm mt-1">
                {total} coach{total !== 1 ? 'es' : ''} found
                {searchParams.city ? ` in ${searchParams.city}` : ''}
              </p>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/40 shrink-0">Sort by</span>
              <select
                defaultValue={searchParams.sortBy || 'rating'}
                className="input text-sm py-2 w-auto"
              >
                <option value="rating">Highest Rated</option>
                <option value="most_reviewed">Most Reviewed</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-7">
            {/* Filters sidebar */}
            <div className="lg:w-60 shrink-0">
              <Suspense fallback={<div className="card h-96 animate-pulse" />}>
                <SearchFilters />
              </Suspense>
            </div>

            {/* Results */}
            <div className="flex-1">
              {trainers.length === 0 ? (
                <div className="card p-16 text-center">
                  <Search size={44} className="text-white/15 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-xl mb-2">No coaches found</h3>
                  <p className="text-white/40 text-sm mb-6">
                    {hasCategory
                      ? 'No coaches have listed in this category yet. Check back soon as we grow.'
                      : 'Try adjusting your filters or searching a different city.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/find" className="btn-primary text-sm py-2.5 px-5">
                      Browse categories
                    </Link>
                    <Link href="/search" className="btn-secondary text-sm py-2.5 px-5">
                      Clear all filters
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {trainers.map((trainer, i) => (
                    <div
                      key={trainer.id}
                      className="animate-fade-up"
                      style={{
                        animationDelay: `${Math.min(i * 40, 200)}ms`,
                        animationFillMode: 'both',
                        opacity: 0,
                      }}
                    >
                      <TrainerCard trainer={trainer} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

