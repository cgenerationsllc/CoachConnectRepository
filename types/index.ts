export type UserRole = 'user' | 'trainer' | 'admin'
export type SubscriptionStatus = 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
export type SubscriptionTier = 'none' | 'standard' | 'premium'
export type SubscriptionInterval = 'monthly' | 'yearly'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  saved_trainers: string[]
  created_at: string
  updated_at: string
}

export interface TrainerProfile {
  id: string
  user_id: string
  display_name: string
  slug: string
  tagline: string | null
  bio: string | null
  years_experience: number
  gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | null
  city: string | null
  state: string | null
  country: string
  remote_available: boolean
  contact_email: string | null
  contact_phone: string | null
  website_url: string | null
  instagram_handle: string | null
  tiktok_handle: string | null
  youtube_url: string | null
  facebook_url: string | null
  session_rate_min: number | null
  session_rate_max: number | null
  rate_currency: string
  rate_type: 'session' | 'week' | 'month' | null
  availability_notes: string | null
  languages: string[]
  profile_image_url: string | null
  cover_image_url: string | null
  gallery_urls: string[]
  intro_video_url: string | null
  sports: string[]
  goals: string[]
  certifications: string[]
  is_certified: boolean
  is_active: boolean
  is_premium: boolean
  subscription_status: SubscriptionStatus
  subscription_tier: SubscriptionTier
  subscription_interval: SubscriptionInterval
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  trial_ends_at: string | null
  average_rating: number
  review_count: number
  profile_views: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  trainer_id: string
  reviewer_id: string | null
  inquiry_id: string | null
  rating: number
  title: string | null
  body: string | null
  reviewer_name: string
  trainer_response: string | null
  trainer_response_at: string | null
  is_verified: boolean
  is_flagged: boolean
  created_at: string
}

export interface Inquiry {
  id: string
  trainer_id: string
  sender_id: string | null
  sender_name: string
  sender_email: string
  sender_phone: string | null
  message: string
  goal: string | null
  is_read: boolean
  created_at: string
}

export interface SearchFilters {
  query?: string
  sport?: string
  goal?: string
  city?: string
  state?: string
  remote?: boolean
  certified?: boolean
  gender?: string
  language?: string
  minRate?: number
  maxRate?: number
  minExperience?: number
  minRating?: number
  sortBy?: 'rating' | 'newest' | 'most_reviewed' | 'price_low' | 'price_high'
}

// ── SPORTS ────────────────────────────────────────────────────
export const SPORTS = [
  'Weightlifting',
  'Weight Loss',
  'Weight Gain / Muscle Building',
  'Athletic Performance',
  'Running & Endurance',
  'Cycling',
  'Swimming',
  'Yoga',
  'Pilates',
  'CrossFit',
  'Boxing & Combat Sports',
  'Martial Arts',
  'Basketball',
  'Soccer',
  'Tennis',
  'American Football',
  'Volleyball',
  'Pickleball',
  'Golf',
  'Lacrosse',
  'Injury Rehabilitation',
  'Nutrition Coaching',
  'Senior Fitness',
  'Youth Sports',
  'HIIT & Cardio',
  'Online Coaching',
] as const

// ── GOALS ─────────────────────────────────────────────────────
export const GOALS = [
  'Lose Weight',
  'Build Muscle',
  'Improve Athletic Performance',
  'Increase Strength',
  'Improve Flexibility',
  'Recover from Injury',
  'Train for Competition',
  'Improve Overall Fitness',
  'Gain Confidence',
  'Improve Nutrition',
  'Improve Skill in Sport',
  'Improve Knowledge',
] as const

// ── LANGUAGES ─────────────────────────────────────────────────
export const LANGUAGES = [
  'English', 'Spanish', 'French', 'Portuguese', 'Mandarin',
  'Arabic', 'Hindi', 'German', 'Italian', 'Japanese', 'Korean',
  'Russian', 'Vietnamese', 'Tagalog', 'Other',
] as const

// ── US STATES ─────────────────────────────────────────────────
export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
] as const

// ── TOP US CITIES FOR SEO ──────────────────────────────────────
export const TOP_CITIES = [
  { city: 'Austin', state: 'TX' },
  { city: 'New York', state: 'NY' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Houston', state: 'TX' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Dallas', state: 'TX' },
] as const

// ── PROMO ──────────────────────────────────────────────────────
export const FOUNDING_PROMO_CODE = 'FOUNDING50'
export const FOUNDING_PROMO_PERCENT = 50
export const FOUNDING_PROMO_MONTHS = 6
export const FOUNDING_PROMO_MAX_USES = 50

// ── REPORT REASONS ────────────────────────────────────────────
export const REPORT_REASONS = [
  'Inappropriate behavior',
  'Fake or misleading profile',
  'Harassment',
  'Fraud or scam',
  'Spam',
  'Other',
] as const

// ── REVIEW FLAG REASONS ───────────────────────────────────────
export const FLAG_REASONS = [
  'Fake review',
  'Abusive language',
  'Spam',
  'Conflict of interest',
  'Other',
] as const
