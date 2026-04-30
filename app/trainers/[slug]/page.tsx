import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export default async function TrainerPage({ params }: Props) {
  const supabase = createClient()
  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!trainer) notFound()

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-4">
        <h1 className="font-display font-black text-4xl mb-4">{trainer.display_name}</h1>
        <p className="text-white/60">{trainer.bio}</p>
        <p className="text-green-400 mt-4">${trainer.session_rate_min}/session</p>
      </div>
      <Footer />
    </div>
  )
}