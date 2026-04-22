import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DashboardClient } from './DashboardClient'
import type { TrainerProfile, Inquiry } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

async function getData() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let inquiries: Inquiry[] = []
  let monthlyViews = 0
  let premiumAvgViews = 0

  if (trainer) {
    const [{ data: inqData }, { count: viewCount }] = await Promise.all([
      supabase
        .from('inquiries')
        .select('*')
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', trainer.id)
        .gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ])
    inquiries = inqData || []
    monthlyViews = viewCount || 0

    // Get average views for premium coaches in same sports
    if (trainer.sports.length > 0 && !trainer.is_premium) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { data: premiumTrainers } = await supabase
        .from('trainer_profiles')
        .select('id')
        .eq('is_premium', true)
        .eq('is_active', true)
        .contains('sports', trainer.sports.slice(0, 1))
        .limit(20)

      if (premiumTrainers && premiumTrainers.length > 0) {
        const ids = premiumTrainers.map((t) => t.id)
        const { count: premiumViews } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .in('trainer_id', ids)
          .gte('viewed_at', thirtyDaysAgo)

        premiumAvgViews = Math.round((premiumViews || 0) / premiumTrainers.length)
      }
    }
  }

  return { user, profile, trainer, inquiries, monthlyViews, premiumAvgViews }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { subscription?: string; tab?: string }
}) {
  const { user, profile, trainer, inquiries, monthlyViews, premiumAvgViews } = await getData()

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display font-black text-4xl mb-1">
            {profile?.full_name ? `Hey, ${profile.full_name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-white/35 text-sm">{user.email}</p>
        </div>

        {searchParams.subscription === 'success' && (
          <div className="mb-6 px-5 py-4 rounded-2xl bg-green-500/10 border border-green-500/25 text-green-300 text-sm flex items-center gap-3">
            <span className="text-xl">🎉</span>
            Your subscription is active — your profile is now live on CoachConnect!
          </div>
        )}

        <DashboardClient
          trainer={trainer as TrainerProfile | null}
          inquiries={inquiries}
          userId={user.id}
          monthlyViews={monthlyViews}
          premiumAvgViews={premiumAvgViews}
          defaultTab={searchParams.tab}
        />
      </div>
      <Footer />
    </div>
  )
}
