'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Star } from 'lucide-react'

const schema = z.object({
  reviewer_name: z.string().min(2, 'Name required'),
  title: z.string().optional(),
  body: z.string().min(10, 'Please write at least 10 characters'),
})
type FormData = z.infer<typeof schema>

export function ReviewForm({ trainerId }: { trainerId: string }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (rating === 0) { toast.error('Please select a star rating'); return }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, trainer_id: trainerId, rating }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to submit review')
        return
      }
      setSubmitted(true)
      toast.success('Review submitted!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <p className="text-2xl mb-2">⭐</p>
        <p className="font-semibold mb-1">Thank you for your review!</p>
        <p className="text-white/35 text-sm">Your feedback helps others find the right coach.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Stars */}
      <div>
        <label className="label">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star size={28} className={star <= (hovered || rating) ? 'star-full' : 'star-empty'} fill="currentColor" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Your Name</label>
        <input {...register('reviewer_name')} className="input" placeholder="Jane Smith" />
        {errors.reviewer_name && <p className="text-red-400 text-xs mt-1">{errors.reviewer_name.message}</p>}
      </div>

      <div>
        <label className="label">Review Title (optional)</label>
        <input {...register('title')} className="input" placeholder="Great coach for beginners!" />
      </div>

      <div>
        <label className="label">Your Review</label>
        <textarea {...register('body')} rows={4} className="input resize-none" placeholder="Share your experience with this coach — what did they help you achieve?" />
        {errors.body && <p className="text-red-400 text-xs mt-1">{errors.body.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Review'}
      </button>
    </form>
  )
}
