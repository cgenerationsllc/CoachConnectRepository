'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import { SPORTS, GOALS, US_STATES, LANGUAGES } from '@/types'
import { Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import type { TrainerProfile } from '@/types'
import Image from 'next/image'

const schema = z.object({
  display_name: z.string().min(2, 'Name is required'),
  tagline: z.string().max(120).optional(),
  bio: z.string().min(10, 'Bio is required — tell clients about yourself').max(2000),
  years_experience: z.number().min(0).max(60),
  gender: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  remote_available: z.boolean(),
  contact_email: z.string().email('Valid email required').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  instagram_handle: z.string().optional(),
  tiktok_handle: z.string().optional(),
  youtube_url: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  intro_video_url: z.string().url().optional().or(z.literal('')),
  session_rate_min: z.number().min(0).optional().nullable(),
  session_rate_max: z.number().min(0).optional().nullable(),
  availability_notes: z.string().max(200).optional(),
  certifications_text: z.string().optional(),
  is_certified: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  trainer: TrainerProfile | null
  userId: string
  onSaved: () => void
}

export function ProfileEditor({ trainer, userId, onSaved }: Props) {
  const [selectedSports, setSelectedSports] = useState<string[]>(trainer?.sports || [])
  const [selectedGoals, setSelectedGoals] = useState<string[]>(trainer?.goals || [])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(trainer?.languages || ['English'])
  const [profileImageUrl, setProfileImageUrl] = useState(trainer?.profile_image_url || '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: trainer?.display_name || '',
      tagline: trainer?.tagline || '',
      bio: trainer?.bio || '',
      years_experience: trainer?.years_experience || 0,
      gender: trainer?.gender || '',
      city: trainer?.city || '',
      state: trainer?.state || '',
      remote_available: trainer?.remote_available ?? true,
      contact_email: trainer?.contact_email || '',
      contact_phone: trainer?.contact_phone || '',
      website_url: trainer?.website_url || '',
      instagram_handle: trainer?.instagram_handle || '',
      tiktok_handle: trainer?.tiktok_handle || '',
      youtube_url: trainer?.youtube_url || '',
      facebook_url: trainer?.facebook_url || '',
      intro_video_url: trainer?.intro_video_url || '',
      session_rate_min: trainer?.session_rate_min ?? null,
      session_rate_max: trainer?.session_rate_max ?? null,
      availability_notes: trainer?.availability_notes || '',
      certifications_text: trainer?.certifications.join('\n') || '',
      is_certified: trainer?.is_certified || false,
    },
  })

  const contactEmail = watch('contact_email')
  const contactPhone = watch('contact_phone')
  const hasContactMethod = !!(contactEmail || contactPhone)

  const toggleSport = (s: string) =>
    setSelectedSports((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  const toggleGoal = (g: string) =>
    setSelectedGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])
  const toggleLanguage = (l: string) =>
    setSelectedLanguages((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${userId}/profile.${ext}`
      const { error: uploadError } = await supabase.storage.from('coach-images').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('coach-images').getPublicUrl(path)
      setProfileImageUrl(publicUrl)
      toast.success('Photo uploaded!')
    } catch { toast.error('Upload failed') } finally { setUploading(false) }
  }

  const onSubmit = async (data: FormData) => {
    if (!hasContactMethod) {
      toast.error('At least one contact method is required — email or phone')
      return
    }
    if (selectedSports.length === 0) {
      toast.error('Please select at least one specialty')
      return
    }

    try {
      const supabase = createClient()
      const certs = (data.certifications_text || '').split('\n').map((s) => s.trim()).filter(Boolean)
      const slug = trainer?.slug || generateSlug(data.display_name, userId)

      const payload = {
        user_id: userId,
        display_name: data.display_name,
        slug,
        tagline: data.tagline || null,
        bio: data.bio,
        years_experience: data.years_experience,
        gender: data.gender || null,
        city: data.city || null,
        state: data.state || null,
        remote_available: data.remote_available,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        website_url: data.website_url || null,
        instagram_handle: data.instagram_handle || null,
        tiktok_handle: data.tiktok_handle || null,
        youtube_url: data.youtube_url || null,
        facebook_url: data.facebook_url || null,
        intro_video_url: data.intro_video_url || null,
        session_rate_min: data.session_rate_min || null,
        session_rate_max: data.session_rate_max || null,
        availability_notes: data.availability_notes || null,
        languages: selectedLanguages.length > 0 ? selectedLanguages : ['English'],
        profile_image_url: profileImageUrl || null,
        sports: selectedSports,
        goals: selectedGoals,
        certifications: certs,
        is_certified: data.is_certified,
      }

      if (trainer) {
        const { error } = await supabase.from('trainer_profiles').update(payload).eq('id', trainer.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('trainer_profiles').insert(payload)
        if (error) throw error
        await supabase.from('profiles').update({ role: 'trainer' }).eq('id', userId)
      }

      onSaved()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile')
    }
  }

  const sectionClass = 'card p-6 space-y-4'
  const tagBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-all duration-150 ${
      active ? 'bg-green-500 border-green-500 text-white font-semibold' : 'bg-transparent border-white/12 text-white/50 hover:border-white/25 hover:text-white/80'
    }`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Photo */}
      <div className={sectionClass}>
        <h3 className="font-display font-bold text-lg">Profile Photo</h3>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-charcoal-700 overflow-hidden shrink-0 flex items-center justify-center">
            {profileImageUrl
              ? <Image src={profileImageUrl} alt="Profile" width={80} height={80} className="object-cover w-full h-full" />
              : <Upload size={22} className="text-white/25" />}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-secondary text-sm py-2 disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <p className="text-white/25 text-xs mt-1.5">JPG, PNG or WebP · Max 5MB · Required</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className={sectionClass}>
        <h3 className="font-display font-bold text-lg">Basic Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Display Name <span className="text-red-400">*</span></label>
            <input {...register('display_name')} className="input" placeholder="Coach Jane Smith" />
            {errors.display_name && <p className="text-red-400 text-xs mt-1">{errors.display_name.message}</p>}
          </div>
          <div>
            <label className="label">Years of Experience</label>
            <input {...register('years_experience', { valueAsNumber: true })} type="number" min="0" max="60" className="input" />
          </div>
        </div>
        <div>
          <label className="label">Tagline <span className="text-white/30">(one sentence shown on your card if you're Premium)</span></label>
          <input {...register('tagline')} className="input" placeholder="Helping athletes reach their peak performance" maxLength={120} />
        </div>
        <div>
          <label className="label">Bio <span className="text-red-400">*</span> <span className="text-white/30">(tell clients who you are and how you help)</span></label>
          <textarea {...register('bio')} rows={5} className="input resize-none" maxLength={2000} placeholder="Share your background, training philosophy, and what makes you the right coach for your clients..." />
          {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Gender</label>
            <select {...register('gender')} className="input">
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
            </select>
          </div>
          <div>
            <label className="label">Session Rate <span className="text-red-400">*</span></label>
            <div className="flex gap-2">
              <input {...register('session_rate_min', { valueAsNumber: true })} type="number" min="0" placeholder="Min $" className="input w-1/2" />
              <input {...register('session_rate_max', { valueAsNumber: true })} type="number" min="0" placeholder="Max $" className="input w-1/2" />
            </div>
            <p className="text-white/25 text-xs mt-1">Per session. Enter same number for flat rate.</p>
          </div>
        </div>
        <div>
          <label className="label">Availability</label>
          <input {...register('availability_notes')} className="input" placeholder="e.g. Mon / Wed / Fri mornings, weekends by request" maxLength={200} />
        </div>
      </div>

      {/* Location */}
      <div className={sectionClass}>
        <h3 className="font-display font-bold text-lg">Location</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">City</label>
            <input {...register('city')} className="input" placeholder="Austin" />
          </div>
          <div>
            <label className="label">State</label>
            <select {...register('state')} className="input">
              <option value="">Select state...</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input {...register('remote_available')} type="checkbox" className="w-4 h-4 accent-green-500" />
          <span className="text-sm text-white/65">I offer remote / online coaching</span>
        </label>
      </div>

      {/* Specialties */}
      <div className={sectionClass}>
        <h3 className="font-display font-bold text-lg">Specialties <span className="text-red-400">*</span></h3>
        <p className="text-white/35 text-sm">Select all that apply — this is how clients find you</p>
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((sport) => (
            <button key={sport} type="button" onClick={() => toggleSport(sport)} className={tagBtn(selectedSports.includes(sport))}>
              {sport}
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className={sectionClass}>
        <h3 className="font-display font-bold text-lg">Goals I Help With</h3>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((goal) => (
            <button key={goal} type="button" onClick={() => toggleGoal(goal)} className={tagBtn(selectedGoals.includes(goal))}>
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className={sectionClass}>
        <h3 className="font-display font-bold text-lg">Languages Spoken</h3>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button key={lang} type="button" onClick={() => toggleLanguage(lang)} className={tagBtn(selectedLanguages.includes(lang))}>
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Certifications</h3>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input {...register('is_certified')} type="checkbox" className="w-4 h-4 accent-green-500" />
            <span className="text-white/60">Show "Certified" badge on my profile</span>
          </label>
        </div>
        <p className="text-white/35 text-sm">One per line. Highly recommended — it builds trust with clients.</p>
        <textarea
          {...register('certifications_text')}
          rows={4}
          className="input resize-none"
          placeholder={"NASM Certified Personal Trainer\nACE Group Fitness Instructor\nCPR/AED Certified"}
        />
      </div>

      {/* Contact & Links */}
      <div className={sectionClass}>
        <h3 className="font-display font-bold text-lg">Contact & Links <span className="text-red-400">*</span></h3>
        <p className="text-white/35 text-sm">At least one contact method is required — email or phone.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Contact Email</label>
            <input {...register('contact_email')} type="email" className="input" placeholder="coach@example.com" />
            {errors.contact_email && <p className="text-red-400 text-xs mt-1">{errors.contact_email.message}</p>}
          </div>
          <div>
            <label className="label">Contact Phone</label>
            <input {...register('contact_phone')} type="tel" className="input" placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="label">Website</label>
            <input {...register('website_url')} className="input" placeholder="https://yoursite.com" />
          </div>
          <div>
            <label className="label">Instagram Handle</label>
            <input {...register('instagram_handle')} className="input" placeholder="yourhandle (no @)" />
          </div>
          <div>
            <label className="label">TikTok Handle</label>
            <input {...register('tiktok_handle')} className="input" placeholder="yourhandle (no @)" />
          </div>
          <div>
            <label className="label">YouTube URL</label>
            <input {...register('youtube_url')} className="input" placeholder="https://youtube.com/..." />
          </div>
          <div>
            <label className="label">Facebook URL</label>
            <input {...register('facebook_url')} className="input" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="label">Intro Video URL <span className="text-white/30">(YouTube or Instagram)</span></label>
            <input {...register('intro_video_url')} className="input" placeholder="https://youtube.com/..." />
          </div>
        </div>
        {!hasContactMethod && (
          <p className="text-amber-400 text-xs">⚠️ You must provide at least an email or phone number before saving.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-4 text-base"
      >
        {isSubmitting
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : trainer ? 'Save Changes' : 'Create My Profile'}
      </button>
    </form>
  )
}
