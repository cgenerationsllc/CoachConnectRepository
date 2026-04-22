'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Target } from 'lucide-react'
import { SPORTS } from '@/types'

export function HomeSearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sport, setSport] = useState('')
  const [city, setCity] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (sport) params.set('sport', sport)
    if (city) params.set('city', city)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
      <div className="card p-2 flex flex-col md:flex-row gap-2">
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5">
          <Search size={17} className="text-white/30 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
          />
        </div>
        <div className="hidden md:block w-px bg-white/8 my-2" />
        <div className="flex items-center gap-3 px-4 py-2.5 min-w-[170px]">
          <Target size={17} className="text-white/30 shrink-0" />
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-white/60 appearance-none cursor-pointer"
          >
            <option value="" className="bg-charcoal-800">All sports</option>
            {SPORTS.map((s) => <option key={s} value={s} className="bg-charcoal-800">{s}</option>)}
          </select>
        </div>
        <div className="hidden md:block w-px bg-white/8 my-2" />
        <div className="flex items-center gap-3 px-4 py-2.5 min-w-[140px]">
          <MapPin size={17} className="text-white/30 shrink-0" />
          <input
            type="text"
            placeholder="City..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
          />
        </div>
        <button type="submit" className="btn-primary px-6 py-2.5 text-sm whitespace-nowrap">
          Find a Coach
        </button>
      </div>
    </form>
  )
}
