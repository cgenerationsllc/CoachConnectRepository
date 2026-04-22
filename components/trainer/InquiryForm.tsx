'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Send, Mail, Phone } from 'lucide-react'
import { GOALS } from '@/types'
import type { TrainerProfile } from '@/types'

const schema = z.object({
  sender_name: z.string().min(2, 'Name is required'),
  sender_email: z.string().email('Valid email required'),
  sender_phone: z.string().optional(),
  goal: z.string().optional(),
  message: z.string().min(20, 'Please write at least 20 characters'),
})
type FormData = z.infer<typeof schema>

export function InquiryForm({ trainer }: { trainer: TrainerProfile }) {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, trainer_id: trainer.id }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      toast.success('Message sent!')
    } catch {
      toast.error('Failed to send. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="card p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
          <Send size={22} className="text-green-400" />
        </div>
        <h3 className="font-display font-bold text-lg mb-2">Message Sent!</h3>
        <p className="text-white/40 text-sm mb-4">{trainer.display_name} will be in touch with you soon.</p>
        {/* Show direct contact info after inquiry */}
        {trainer.contact_email && (
          <a href={`mailto:${trainer.contact_email}`} className="flex items-center justify-center gap-2 text-sm text-green-400 hover:underline">
            <Mail size={13} /> {trainer.contact_email}
          </a>
        )}
        {trainer.contact_phone && (
          <a href={`tel:${trainer.contact_phone}`} className="flex items-center justify-center gap-2 text-sm text-green-400 hover:underline mt-1">
            <Phone size={13} /> {trainer.contact_phone}
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="card p-5">
      <h3 className="font-display font-bold text-lg mb-4">Contact {trainer.display_name}</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="label">Your Name</label>
          <input {...register('sender_name')} className="input" placeholder="Jane Smith" />
          {errors.sender_name && <p className="text-red-400 text-xs mt-1">{errors.sender_name.message}</p>}
        </div>

        <div>
          <label className="label">Email</label>
          <input {...register('sender_email')} type="email" className="input" placeholder="jane@email.com" />
          {errors.sender_email && <p className="text-red-400 text-xs mt-1">{errors.sender_email.message}</p>}
        </div>

        <div>
          <label className="label">Phone (optional)</label>
          <input {...register('sender_phone')} type="tel" className="input" placeholder="+1 (555) 000-0000" />
        </div>

        <div>
          <label className="label">Your Goal</label>
          <select {...register('goal')} className="input">
            <option value="">Select a goal...</option>
            {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Message</label>
          <textarea
            {...register('message')}
            rows={4}
            className="input resize-none"
            placeholder="Tell this coach about your goals, current fitness level, and what you're looking for..."
          />
          {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Send size={15} /> Send Message</>}
        </button>
      </form>
    </div>
  )
}
