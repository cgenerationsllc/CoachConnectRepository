'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export function HomeSearchBar() {
  const router = useRouter()

  return (
    <div className="flex justify-center">
      <button
        onClick={() => router.push('/find')}
        className="btn-primary text-lg px-10 py-4 flex items-center gap-3"
      >
        Find a Coach
        <ArrowRight size={20} />
      </button>
    </div>
  )
}
