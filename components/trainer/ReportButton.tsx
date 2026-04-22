'use client'

import { useState } from 'react'
import { Flag, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { REPORT_REASONS } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  trainerId: string
  trainerName: string
}

export function ReportButton({ trainerId, trainerName }: Props) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{
    reason: string
    details: string
  }>()

  const onSubmit = async (data: { reason: string; details: string }) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: trainerId, ...data }),
      })
      if (!res.ok) throw new Error()
      toast.success('Report submitted. We will review it shortly.')
      setOpen(false)
      reset()
    } catch {
      toast.error('Failed to submit report. Please try again.')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 text-xs text-white/25 hover:text-red-400 transition-colors py-2"
      >
        <Flag size={12} /> Report this coach
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card p-6 w-full max-w-md relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white">
              <X size={18} />
            </button>
            <h3 className="font-display font-bold text-lg mb-1">Report {trainerName}</h3>
            <p className="text-white/40 text-sm mb-5">Reports are reviewed by the CoachConnect team within 48 hours.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Reason</label>
                <select {...register('reason', { required: true })} className="input">
                  <option value="">Select a reason...</option>
                  {REPORT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Details (optional)</label>
                <textarea {...register('details')} rows={3} className="input resize-none" placeholder="Describe what happened..." />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
