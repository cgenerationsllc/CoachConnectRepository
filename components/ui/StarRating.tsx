import { Star } from 'lucide-react'
import { renderStars, formatRating } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: number
  showCount?: boolean
  className?: string
}

export function StarRating({ rating, reviewCount, size = 14, showCount = true, className = '' }: StarRatingProps) {
  const { full, half, empty } = renderStars(rating)
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f${i}`} size={size} className="star-full" fill="currentColor" />
        ))}
        {half && (
          <div className="relative">
            <Star size={size} className="star-empty" fill="currentColor" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={size} className="star-full" fill="currentColor" />
            </div>
          </div>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e${i}`} size={size} className="star-empty" fill="currentColor" />
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm font-semibold text-white/90">{formatRating(rating)}</span>
      )}
      {showCount && reviewCount !== undefined && (
        <span className="text-sm text-white/40">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
      )}
    </div>
  )
}
