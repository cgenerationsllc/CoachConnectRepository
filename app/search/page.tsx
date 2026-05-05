import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { TrainerCard } from '@/components/trainer/TrainerCard'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SortSelector } from '@/components/search/SortSelector'
import { Search } from 'lucide-react'
import type { TrainerProfile } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Find a Coach' }

async function getTrainers(sp: Record<string, string | undefined>) {
  const supabase = createClient()

  let query = supabase
    .from('trainer_profiles')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (sp.q) {
    query = query.or(`display_name.ilike.%${sp.q}%,bio.ilike.%${sp.q}%,tagline.ilike.%${sp.q}%`)
  }
  // Handle top level category filtering
  if (sp.category === 'weightlifting') {
    query = query.contains('sports', ['Weightlifting'])
  } else if (sp.category === 'weight-loss') {
    query = query.contains('sports', ['Weight Loss'])
  } else if (sp.category === 'youth-sports') {
    // Show all youth sport subcategories
    if (sp.sport) {
      query = query.contains('sports', [sp.sport])
    } else {
      query = query.or(
        'sports.cs.{"Youth Soccer"},sports.cs.{"Youth Football"},sports.cs.{"Youth Baseball"},sports.cs.{"Youth Basketball"},sports.cs.{"Youth Wrestling"},sports.cs.{"Youth Track & Field"},sports.cs.{"Youth Swimming"},sports.cs.{"Youth Gymnastics"}'
      )
    }
  } else if (sp.category === 'adult-sports') {
    // Show all adult sport subcategories
    if (sp.sport) {
      query = query.contains('sports', [sp.sport])
    } else {
      query = query.or(
        'sports.cs.{"Cycling"},sports.cs.{"Ironman & Triathlon"},sports.cs.{"Pickleball"},sports.cs.{"Tennis"},sports.cs.{"Golf"},sports.cs.{"Rock Climbing"},sports.cs.{"Marathon & Endurance Running"},sports.cs.{"Swimming"},sports.cs.{"Rowing"}'
      )
    }
  } else if (sp.sport) {
    query = query.contains('sports', [sp.sport])
  }
  if (sp.goal) query = query.contains('goals', [sp.goal])
  if (sp.city) query = query.ilike('city', `%${sp.city}%`)
  if (sp.state) query = query.eq('state', sp.state)
  if (sp.remote === 'true') query = query.eq('remote_available', true)
  if (sp.certified === 'true') query = query.eq('is_certified', true)
  if (sp.gender) query = query.eq('gender', sp.gender)
  if (sp.language) query = query.contains('languages', [sp.language])
  if (sp.minRate) query = query.gte('session_rate_min', parseInt(sp.minRate))
  if (sp.maxRate) query = query.lte('session_rate_max', parseInt(sp.maxRate))
  if (sp.minExperience) query = query.gte('years_experience', parseInt(sp.minExperience))
  if (sp.minRating) query = query.gte('average_rating', parseFloat(sp.minRating))

  // Sort: premium always within the selected sort
  const sort = sp.sortBy || 'rating'
  if (sort === 'rating') query = query.order('is_premium', { ascending: false }).order('average_rating', { ascending: false })
  else if (sort === 'most_reviewed') query = query.order('is_premium', { ascending: false }).order('review_count', { ascending: false })
  else if (sort === 'newest') query = query.order('is_premium', { ascending: false }).order('created_at', { ascending: false })
  else if (sort === 'price_low') query = query.order('is_premium', { ascending: false }).order('session_rate_min', { ascending: true, nullsFirst: false })
  else if (sort === 'price_high') query = query.order('is_premium', { ascending: false }).order('session_rate_min', { ascending: false, nullsFirst: false })

  query = query.limit(24)

  const { data, count } = await query
  return { trainers: (data || []) as TrainerProfile[], total: count || 0 }
}

interface Props {
  searchParams: Record<string, string | undefined>
}

export default async function SearchPage({ searchParams }: Props) {
  const { trainers, total } = await getTrainers(searchParams)

  const categoryLabels: Record<string, string> = {
    'weightlifting': 'Weightlifting Coaches',
    'weight-loss': 'Weight Loss Coaches',
    'youth-sports': 'Youth Sports Coaches',
    'adult-sports': 'Adult Sports Coaches',
  }

  const title = searchParams.category
    ? categoryLabels[searchParams.category] || 'Find a Coach'
    : searchParams.sport
      ? `${searchParams.sport} Coaches`
      : searchParams.city
        ? `Coaches in ${searchParams.city}`
        : 'Find a Coach'

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
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
              <span className="text-white/40">Sort by</span>
              <Suspense fallback={<div className="w-32 h-9 bg-white/5 animate-pulse rounded-lg" />}>
                <SortSelector />
              </Suspense>
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
                  <p className="text-white/40 text-sm">Try adjusting your filters or searching a different city.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {trainers.map((trainer, i) => (
                    <div key={trainer.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i * 40, 200)}ms`, animationFillMode: 'both', opacity: 0 }}>
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

