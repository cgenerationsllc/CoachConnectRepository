import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StarRating } from '@/components/ui/StarRating'
import { formatLocation, formatRate } from '@/lib/utils'
import { MapPin, Wifi, Clock, CheckCircle, Award, DollarSign, Calendar, ShieldCheck, Star } from 'lucide-react'
import type { TrainerProfile } from '@/types'

interface Props { params: { slug: string } }

async function logView(trainerId: string) {
  try {
    const supabase = createClient()
    await supabase.from('profile_views').insert({ trainer_id: trainerId })
  } catch { }
}

export default async function TrainerPage({ params }: Props) {
  const supabase = createClient()
  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!trainer) notFound()

  logView(trainer.id).catch(() => { })

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="relative h-56 bg-charcoal-800 mt-16">
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 pb-24 space-y-5">

        {/* Profile header */}
        <div className="card p-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-charcoal-700 shrink-0">
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
                {trainer.is_premium && <span className="badge-premium"><Star size={11} fill="currentColor" /> Premium</span>}
                {trainer.is_certified && <span className="badge-certified"><ShieldCheck size={12} /> Certified</span>}
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
              </div>
            </div>
          </div>

          {/* Rate and availability */}
          <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/5">
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
          </div>
        </div>

        {/* Bio */}
        {trainer.bio && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg mb-3">About</h2>
            <p className="text-white/65 leading-relaxed text-sm">{trainer.bio}</p>
          </div>
        )}

        {/* Sports */}
        {trainer.sports && trainer.sports.length > 0 && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg mb-3">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {trainer.sports.map((s: string) => <span key={s} className="badge-sport">{s}</span>)}
            </div>
          </div>
        )}

        {/* Goals */}
        {trainer.goals && trainer.goals.length > 0 && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg mb-3">Goals I Help With</h2>
            <div className="flex flex-wrap gap-2">
              {trainer.goals.map((g: string) => (
                <span key={g} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-white/8 text-white/60">
                  <CheckCircle size={11} className="text-green-400" /> {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {trainer.certifications && trainer.certifications.length > 0 && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <Award size={17} className="text-green-400" /> Certifications
            </h2>
            <ul className="space-y-2">
              {trainer.certifications.map((cert: string) => (
                <li key={cert} className="flex items-center gap-2 text-white/65 text-sm">
                  <ShieldCheck size={13} className="text-green-400 shrink-0" /> {cert}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact info box - simple version */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-lg mb-4">Contact This Coach</h2>
          {trainer.contact_email && (
            <a href={`mailto:${trainer.contact_email}`} className="flex items-center gap-2 text-green-400 hover:underline text-sm mb-2">
              📧 {trainer.contact_email}
            </a>
          )}
          {trainer.contact_phone && (
            <a href={`tel:${trainer.contact_phone}`} className="flex items-center gap-2 text-green-400 hover:underline text-sm">
              📞 {trainer.contact_phone}
            </a>
          )}
          {!trainer.contact_email && !trainer.contact_phone && (
            <p className="text-white/40 text-sm">Contact information not provided.</p>
          )}
        </div>

      </div>
      <Footer />
    </div>
  )
}