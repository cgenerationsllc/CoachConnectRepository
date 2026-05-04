import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

export function generateSlug(name: string, id: string): string {
  return `${slugify(name)}-${id.slice(0, 6)}`
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function renderStars(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return { full, half, empty }
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`
  return `${Math.floor(seconds / 31536000)}y ago`
}

export function formatLocation(city: string | null, state: string | null): string {
  if (city && state) return `${city}, ${state}`
  if (city) return city
  if (state) return state
  return 'Location not listed'
}

export function formatRate(min: number | null, max: number | null, type?: string | null): string {
  const period = type === 'week' ? 'week' : type === 'month' ? 'month' : 'session'
  if (!min && !max) return 'Rate not listed'
  if (min && max && min !== max) return `$${min}–$${max}/${period}`
  return `$${min || max}/${period}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
