import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StarRating } from '@/components/ui/StarRating'
import { ReviewList } from '@/components/review/ReviewList'
import { ReviewForm } from '@/components/review/ReviewForm'
import { InquiryForm } from '@/components/trainer/InquiryForm'
import { ReportButton } from '@/components/trainer/ReportButton'
import { formatLocation, formatRate, timeAgo } from '@/lib/utils'
import {
  MapPin, Wifi, Globe, Instagram, Clock, CheckCircle,
  Star, Award, DollarSign, Calendar, Youtube, Facebook,
  ShieldCheck, Video, MessageSquare
} from 'lucide-react'
import type { TrainerProfile, Review } from '@/types'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

async function getTrainer(slug: string): Promise<TrainerProfile | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('trainer_profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
}

async function getReviews(trainerId: string): Promise<Review[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('trainer_id', trainerId)
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })
    .limit(30)
  return data || []
}

async function logView(trainerId: string) {
  const supabase = createClient()
  await supabase.from('profile_views').insert({ trainer_id: trainerId })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trainer = await getTrainer(params.slug)
  if (!trainer) return { title: 'Coach Not Found' }
  return {
    title: `${trainer.display_name} — Personal Coach`,
    description: trainer.bio?.slice(0, 155) || trainer.tagline || `${trainer.display_name} is a personal coach on CoachConnect.`,
  }
}

export default async function TrainerPage({ params }: Props) {
  const trainer = await getTrainer(params.slug)
  if (!trainer) notFound()

  const reviews = await getReviews(trainer.id)
  await logView(trainer.id)

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Cover */}
      <div className="relative h-56 md:h-72 bg-charcoal-800 mt-16">
        {trainer.cover_image_url && (
          <Image src={trainer.cover_image_url} alt="Cover" fill className="object-cover opacity-40" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT COLUMN ─────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Profile header */}
            <div className="card p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-charcoal-700 shrink-0 border-2 border-charcoal-950">
                  {trainer.profile_image_url ? (
                    <Image src={trainer.profile_image_url} alt={trainer.display_name} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-3xl font-black text-green-400">
                      {trainer.display_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="font-display font-black text-3xl">{trainer.display_name}</h1>
                    {trainer.is_premium && (
                      <span className="badge-premium"><Star size={11} fill="currentColor" /> Premium</span>
                    )}
                    {trainer.is_certified && (
                      <span className="badge-certified"><ShieldCheck size={12} /> Certified</span>
                    )}
                  </div>

                  {trainer.tagline && <p className="text-white/50 mb-2">{trainer.tagline}</p>}
                  <StarRating rating={trainer.average_rating} reviewCount={trainer.review_count} size={15} className="mb-3" />

                  <div className="flex flex-wrap gap-4 text-sm text-white/40">
                    {(trainer.city || trainer.state) && (
                      <span className="flex items-center gap-1.5"><MapPin size={13} />{formatLocation(trainer.city, trainer.state)}</span>
                    )}
                    {trainer.remote_available && (
                      <span className="flex items-center gap-1.5"><Wifi size={13} />Remote available</span>
                    )}
                    {trainer.years_experience > 0 && (
                      <span className="flex items-center gap-1.5"><Clock size={13} />{trainer.years_experience} yrs experience</span>
                    )}
                    {trainer.gender && (
                      <span className="capitalize text-white/30">{trainer.gender.replace('_', ' ')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick info row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/5">
                {(trainer.session_rate_min || trainer.session_rate_max) && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={15} className="text-green-400" />
                    <div>
                      <p className="text-xs text-white/40">Rate</p>
                      <p className="text-sm font-semibold text-green-400">{formatRate(trainer.session_rate_min, trainer.session_rate_max)}</p>
                    </div>
                  </div>
                )}
                {trainer.availability_notes && (
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-green-400" />
                    <div>
                      <p className="text-xs text-white/40">Availability</p>
                      <p className="text-sm font-medium">{trainer.availability_notes}</p>
                    </div>
                  </div>
                )}
                {trainer.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <MessageSquare size={15} className="text-green-400" />
                    <div>
                      <p className="text-xs text-white/40">Languages</p>
                      <p className="text-sm font-medium">{trainer.languages.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video intro */}
            {trainer.intro_video_url && (
              <div className="card p-5">
                <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <Video size={17} className="text-green-400" /> Introduction Video
                </h2>
                <a href={trainer.intro_video_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-400 hover:underline text-sm">
                  Watch intro video <Globe size={13} />
                </a>
              </div>
            )}

            {/* Bio */}
            {trainer.bio && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-lg mb-3">About</h2>
                <p className="text-white/65 leading-relaxed whitespace-pre-line text-sm">{trainer.bio}</p>
              </div>
            )}

            {/* Sports & Goals */}
            {(trainer.sports.length > 0 || trainer.goals.length > 0) && (
              <div className="card p-6 space-y-4">
                {trainer.sports.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-lg mb-3">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {trainer.sports.map((s) => <span key={s} className="badge-sport">{s}</span>)}
                    </div>
                  </div>
                )}
                {trainer.goals.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-lg mb-3">Goals I Help With</h2>
                    <div className="flex flex-wrap gap-2">
                      {trainer.goals.map((g) => (
                        <span key={g} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-white/8 text-white/60">
                          <CheckCircle size={11} className="text-green-400" /> {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Certifications */}
            {trainer.certifications.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <Award size={17} className="text-green-400" /> Certifications
                </h2>
                <ul className="space-y-2">
                  {trainer.certifications.map((cert) => (
                    <li key={cert} className="flex items-center gap-2 text-white/65 text-sm">
                      <ShieldCheck size={13} className="text-green-400 shrink-0" /> {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gallery */}
            {trainer.gallery_urls.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-lg mb-4">Gallery</h2>
                <div className="grid grid-cols-3 gap-3">
                  {trainer.gallery_urls.slice(0, 6).map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-charcoal-700">
                      <Image src={url} alt={`Gallery ${i + 1}`} width={200} height={200} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg">
                  Reviews <span className="text-white/30 font-normal text-base">({trainer.review_count})</span>
                </h2>
                {trainer.average_rating > 0 && (
                  <div className="text-right">
                    <div className="font-display text-4xl font-black text-green-400">{trainer.average_rating.toFixed(1)}</div>
                    <StarRating rating={trainer.average_rating} showCount={false} size={13} />
                  </div>
                )}
              </div>
              <ReviewList reviews={reviews} />
            </div>

            {/* Leave a review */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg mb-4">Leave a Review</h2>
              <p className="text-white/40 text-sm mb-5">Only users who have contacted this coach can leave a review.</p>
              <ReviewForm trainerId={trainer.id} />
            </div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────── */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Contact / Inquiry form */}
              <InquiryForm trainer={trainer} />

              {/* Social links */}
              {(trainer.website_url || trainer.instagram_handle || trainer.youtube_url || trainer.tiktok_handle || trainer.facebook_url) && (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-white/50 mb-3">Connect</h3>
                  <div className="space-y-2.5">
                    {trainer.website_url && (
                      <a href={trainer.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                        <Globe size={14} className="text-green-400" /> Website
                      </a>
                    )}
                    {trainer.instagram_handle && (
                      <a href={`https://instagram.com/${trainer.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                        <Instagram size={14} className="text-green-400" /> @{trainer.instagram_handle}
                      </a>
                    )}
                    {trainer.youtube_url && (
                      <a href={trainer.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                        <Youtube size={14} className="text-green-400" /> YouTube
                      </a>
                    )}
                    {trainer.tiktok_handle && (
                      <a href={`https://tiktok.com/@${trainer.tiktok_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                        <Globe size={14} className="text-green-400" /> @{trainer.tiktok_handle}
                      </a>
                    )}
                    {trainer.facebook_url && (
                      <a href={trainer.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                        <Facebook size={14} className="text-green-400" /> Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Report button */}
              <ReportButton trainerId={trainer.id} trainerName={trainer.display_name} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
