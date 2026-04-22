'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SPORTS, GOALS, US_STATES, LANGUAGES } from '@/types'
import { SlidersHorizontal, X } from 'lucide-react'

export function SearchFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`/search?${next.toString()}`)
  }

  const toggle = (key: string) => {
    const next = new URLSearchParams(params.toString())
    if (next.get(key)) next.delete(key)
    else next.set(key, 'true')
    router.push(`/search?${next.toString()}`)
  }

  const hasFilters = params.toString().length > 0

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <SlidersHorizontal size={15} />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={() => router.push('/search')}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Sport */}
      <div>
        <label className="label">Sport / Specialty</label>
        <select value={params.get('sport') || ''} onChange={(e) => update('sport', e.target.value)} className="input text-sm">
          <option value="">All specialties</option>
          {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Goal */}
      <div>
        <label className="label">Client Goal</label>
        <select value={params.get('goal') || ''} onChange={(e) => update('goal', e.target.value)} className="input text-sm">
          <option value="">Any goal</option>
          {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="label">City</label>
        <input
          type="text"
          placeholder="e.g. Austin"
          defaultValue={params.get('city') || ''}
          onBlur={(e) => update('city', e.target.value)}
          className="input text-sm"
        />
      </div>

      {/* State */}
      <div>
        <label className="label">State</label>
        <select value={params.get('state') || ''} onChange={(e) => update('state', e.target.value)} className="input text-sm">
          <option value="">All states</option>
          {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="label">Price per Session</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min $"
            defaultValue={params.get('minRate') || ''}
            onBlur={(e) => update('minRate', e.target.value)}
            className="input text-sm w-1/2"
            min={0}
          />
          <input
            type="number"
            placeholder="Max $"
            defaultValue={params.get('maxRate') || ''}
            onBlur={(e) => update('maxRate', e.target.value)}
            className="input text-sm w-1/2"
            min={0}
          />
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="label">Min. Years Experience</label>
        <select value={params.get('minExperience') || ''} onChange={(e) => update('minExperience', e.target.value)} className="input text-sm">
          <option value="">Any experience</option>
          <option value="1">1+ years</option>
          <option value="3">3+ years</option>
          <option value="5">5+ years</option>
          <option value="10">10+ years</option>
        </select>
      </div>

      {/* Language */}
      <div>
        <label className="label">Language</label>
        <select value={params.get('language') || ''} onChange={(e) => update('language', e.target.value)} className="input text-sm">
          <option value="">Any language</option>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Gender */}
      <div>
        <label className="label">Coach Gender</label>
        <select value={params.get('gender') || ''} onChange={(e) => update('gender', e.target.value)} className="input text-sm">
          <option value="">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non_binary">Non-binary</option>
        </select>
      </div>

      {/* Min rating */}
      <div>
        <label className="label">Minimum Rating</label>
        <select value={params.get('minRating') || ''} onChange={(e) => update('minRating', e.target.value)} className="input text-sm">
          <option value="">Any rating</option>
          <option value="3">3+ stars</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
      </div>

      {/* Certified */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div onClick={() => toggle('certified')} className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 cursor-pointer ${params.get('certified') ? 'bg-green-500' : 'bg-white/10'}`}>
          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${params.get('certified') ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm text-white/60">Certified coaches only</span>
      </label>

      {/* Remote */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div onClick={() => toggle('remote')} className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 cursor-pointer ${params.get('remote') ? 'bg-green-500' : 'bg-white/10'}`}>
          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${params.get('remote') ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm text-white/60">Remote / online only</span>
      </label>
    </div>
  )
}
