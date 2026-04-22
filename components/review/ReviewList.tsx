import { ShieldCheck, Flag } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { timeAgo } from '@/lib/utils'
import type { Review } from '@/types'

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-white/25 text-sm text-center py-8">No reviews yet. Be the first to share your experience.</p>
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center text-xs font-bold text-green-400">
                {review.reviewer_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-sm">{review.reviewer_name}</span>
                {review.is_verified && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-400">
                    <ShieldCheck size={11} /> Verified
                  </span>
                )}
              </div>
            </div>
            <span className="text-white/25 text-xs shrink-0">{timeAgo(review.created_at)}</span>
          </div>

          <StarRating rating={review.rating} showCount={false} size={12} className="mb-2 ml-10" />

          {review.title && <p className="font-semibold text-sm mb-1 ml-10">{review.title}</p>}
          {review.body && <p className="text-white/55 text-sm leading-relaxed ml-10">{review.body}</p>}

          {/* Trainer response */}
          {review.trainer_response && (
            <div className="ml-10 mt-3 pl-3 border-l-2 border-green-500/30">
              <p className="text-xs text-green-400 font-semibold mb-1">Coach response</p>
              <p className="text-white/50 text-sm">{review.trainer_response}</p>
            </div>
          )}

          {/* Flag review */}
          <FlagReview reviewId={review.id} />
        </div>
      ))}
    </div>
  )
}

function FlagReview({ reviewId }: { reviewId: string }) {
  return (
    <button
      onClick={async () => {
        const reason = prompt('Why are you flagging this review? (e.g. Fake review, Abusive language)')
        if (!reason) return
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review_id: reviewId, reason }),
        })
        alert('Thank you. This review has been flagged for our team to review.')
      }}
      className="ml-10 mt-2 flex items-center gap-1 text-xs text-white/20 hover:text-red-400 transition-colors"
    >
      <Flag size={10} /> Flag review
    </button>
  )
}
