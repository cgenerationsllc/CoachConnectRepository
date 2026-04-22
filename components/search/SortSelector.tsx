'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function SortSelector() {
  const router = useRouter()
  const params = useSearchParams()
  const current = params.get('sortBy') || 'rating'

  const options = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'most_reviewed', label: 'Most Reviewed' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ]

  const updateSort = (value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value && value !== 'rating') next.set('sortBy', value)
    else next.delete('sortBy')
    router.push(`/search?${next.toString()}`)
  }

  return (
    <select
      name="sortBy"
      value={current}
      onChange={(e) => updateSort(e.target.value)}
      className="input text-sm py-2 w-auto"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
