import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Wifi, ShieldCheck, Star } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { formatLocation } from '@/lib/utils'
import type { TrainerProfile } from '@/types'

interface TrainerCardProps {
  trainer: TrainerProfile
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <Link href={`/trainers/${trainer.slug}`}>
      <div className="card card-hover cursor-pointer flex flex-col h-full overflow-hidden">
        {/* Photo */}
        <div className="relative h-52 bg-charcoal-700">
          {trainer.profile_image_url ? (
            <Image
              src={trainer.profile_image_url}
              alt={trainer.display_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-5xl font-bold text-white/20">
                {trainer.display_name.charAt(0)}
              </span>
            </div>
          )}

          {/* Badges top row */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {trainer.is_premium && (
              <span className="badge-premium text-xs">
                <Star size={10} fill="currentColor" /> Premium
              </span>
            )}
            {trainer.is_certified && (
              <span className="badge-certified ml-auto">
                <ShieldCheck size={11} /> Certified
              </span>
            )}
          </div>
        </div>

        {/* Content — only what spec allows on the card */}
        <div className="p-4 flex flex-col flex-1 gap-2">
          {/* Name */}
          <h3 className="font-display font-bold text-lg leading-tight">{trainer.display_name}</h3>

          {/* Premium-only: one-sentence bio on card */}
          {trainer.is_premium && trainer.tagline && (
            <p className="text-white/50 text-sm line-clamp-1">{trainer.tagline}</p>
          )}

          {/* Star rating */}
          <StarRating
            rating={trainer.average_rating}
            reviewCount={trainer.review_count}
            size={13}
          />

          {/* Location */}
          {(trainer.city || trainer.state) && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <MapPin size={11} />
              {formatLocation(trainer.city, trainer.state)}
              {trainer.remote_available && (
                <>
                  <span className="mx-1">·</span>
                  <Wifi size={11} />
                  <span>Remote</span>
                </>
              )}
            </div>
          )}

          {/* Sports tags — the main filter for users */}
          {trainer.sports.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
              {trainer.sports.slice(0, 3).map((sport) => (
                <span key={sport} className="badge-sport">{sport}</span>
              ))}
              {trainer.sports.length > 3 && (
                <span className="badge-sport">+{trainer.sports.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
