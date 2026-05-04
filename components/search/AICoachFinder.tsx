'use client'

import { useState } from 'react'
import { X, Sparkles, ArrowRight, Loader } from 'lucide-react'
import { GOALS, SPORTS } from '@/types'
import { StarRating } from '@/components/ui/StarRating'
import Link from 'next/link'

interface CoachMatch {
  id: string
  display_name: string
  slug: string
  profile_image_url: string | null
  average_rating: number
  review_count: number
  city: string | null
  state: string | null
  sports: string[]
  ai_reason: string
}

interface FormData {
  goal: string
  fitness_level: string
  preference: string
  city: string
  sport: string
  limitations: string
}

export function AICoachFinder() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form')
  const [matches, setMatches] = useState<CoachMatch[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    goal: '',
    fitness_level: '',
    preference: '',
    city: '',
    sport: '',
    limitations: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.goal || !form.fitness_level) {
      setError('Please fill in at least your goal and fitness level.')
      return
    }
    setError('')
    setStep('loading')

    try {
      const res = await fetch('/api/ai-coach-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setMatches(data.matches || [])
      setStep('results')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStep('form')
    }
  }

  const reset = () => {
    setStep('form')
    setMatches([])
    setError('')
    setForm({ goal: '', fitness_level: '', preference: '', city: '', sport: '', limitations: '' })
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all duration-200 text-sm font-semibold"
      >
        <Sparkles size={16} />
        Not sure where to start?
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                  <Sparkles size={16} className="text-green-400" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg">Find Your Perfect Coach</h2>
                  <p className="text-white/40 text-xs">Answer a few questions and we'll match you</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">

              {/* FORM STEP */}
              {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="label">What is your main fitness goal? <span className="text-red-400">*</span></label>
                    <select
                      value={form.goal}
                      onChange={(e) => setForm({ ...form, goal: e.target.value })}
                      required
                      className="input"
                    >
                      <option value="">Select your goal...</option>
                      {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label">What is your current fitness level? <span className="text-red-400">*</span></label>
                    <select
                      value={form.fitness_level}
                      onChange={(e) => setForm({ ...form, fitness_level: e.target.value })}
                      required
                      className="input"
                    >
                      <option value="">Select your level...</option>
                      <option value="Complete beginner — I rarely exercise">Complete beginner</option>
                      <option value="Beginner — I exercise occasionally">Beginner</option>
                      <option value="Intermediate — I exercise regularly">Intermediate</option>
                      <option value="Advanced — I train seriously">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Do you prefer in-person or online coaching?</label>
                    <select
                      value={form.preference}
                      onChange={(e) => setForm({ ...form, preference: e.target.value })}
                      className="input"
                    >
                      <option value="">No preference</option>
                      <option value="In-person coaching">In-person</option>
                      <option value="Online / remote coaching">Online / remote</option>
                      <option value="Either works for me">Either works</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">What city are you in?</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="input"
                      placeholder="e.g. Austin"
                    />
                  </div>

                  <div>
                    <label className="label">Is there a specific sport or training type you want?</label>
                    <select
                      value={form.sport}
                      onChange={(e) => setForm({ ...form, sport: e.target.value })}
                      className="input"
                    >
                      <option value="">No specific sport</option>
                      {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label">Any injuries, limitations, or special needs?</label>
                    <input
                      type="text"
                      value={form.limitations}
                      onChange={(e) => setForm({ ...form, limitations: e.target.value })}
                      className="input"
                      placeholder="e.g. bad knee, lower back pain, none"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full py-3.5">
                    Find My Coach <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* LOADING STEP */}
              {step === 'loading' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-5">
                    <Loader size={28} className="text-green-400 animate-spin" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2">Finding your matches...</h3>
                  <p className="text-white/40 text-sm">We are searching through our coaches to find the best fit for your goals.</p>
                </div>
              )}

              {/* RESULTS STEP */}
              {step === 'results' && (
                <div>
                  {matches.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/50 mb-4">No coaches found matching your criteria right now.</p>
                      <button onClick={reset} className="btn-secondary text-sm">Try different answers</button>
                    </div>
                  ) : (
                    <>
                      <p className="text-white/50 text-sm mb-5">
                        We found <strong className="text-white">{matches.length} coaches</strong> that match your goals. Here is why each one could be a great fit:
                      </p>

                      <div className="space-y-4 mb-6">
                        {matches.map((coach) => (
                          <div key={coach.id} className="p-4 rounded-2xl bg-white/3 border border-white/5">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 rounded-xl bg-charcoal-700 overflow-hidden shrink-0 flex items-center justify-center">
                                {coach.profile_image_url ? (
                                  <img src={coach.profile_image_url} alt={coach.display_name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-display font-black text-lg text-green-400">
                                    {coach.display_name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold">{coach.display_name}</h3>
                                {coach.average_rating > 0 && (
                                  <StarRating rating={coach.average_rating} reviewCount={coach.review_count} size={12} />
                                )}
                                {(coach.city || coach.state) && (
                                  <p className="text-white/35 text-xs mt-0.5">
                                    {[coach.city, coach.state].filter(Boolean).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* AI explanation */}
                            <div className="flex items-start gap-2 mb-3 px-3 py-2.5 rounded-xl bg-green-500/8 border border-green-500/15">
                              <Sparkles size={13} className="text-green-400 shrink-0 mt-0.5" />
                              <p className="text-white/70 text-xs leading-relaxed">{coach.ai_reason}</p>
                            </div>

                            <Link
                              href={`/trainers/${coach.slug}`}
                              onClick={() => setOpen(false)}
                              className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
                            >
                              View Profile <ArrowRight size={14} />
                            </Link>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button onClick={reset} className="btn-secondary flex-1 text-sm py-2.5">
                          Start over
                        </button>
                        <Link
                          href="/search"
                          onClick={() => setOpen(false)}
                          className="btn-secondary flex-1 text-sm py-2.5 text-center"
                        >
                          Browse all coaches
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
