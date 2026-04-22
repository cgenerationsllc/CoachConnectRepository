'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const searchParams = useSearchParams()
  const isTrainer = searchParams.get('role') === 'trainer'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, role: isTrainer ? 'trainer' : 'user' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Check your email to confirm your account!')
    window.location.href = '/auth/check-email'
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="mb-7">
          <h1 className="font-display font-black text-3xl mb-2">
            {isTrainer ? 'List Your Profile' : 'Create Account'}
          </h1>
          <p className="text-white/40 text-sm">
            {isTrainer ? 'Join CoachConnect and get discovered by clients actively looking for your expertise.' : 'Find your perfect coach today. Browsing is always free.'}
          </p>
          {isTrainer && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-300">
              30-day free trial · No credit card needed to start
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input" placeholder="Jane Smith" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="jane@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="Minimum 8 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-1">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isTrainer ? 'Start Free Trial' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/35 text-sm mt-6">
          Already have an account? <Link href="/auth/login" className="text-green-400 hover:underline">Sign in</Link>
        </p>
        {!isTrainer && (
          <p className="text-center text-white/35 text-sm mt-2">
            Are you a coach? <Link href="/auth/signup?role=trainer" className="text-green-400 hover:underline">List your profile</Link>
          </p>
        )}
        <p className="text-center text-white/20 text-xs mt-5">
          By signing up you agree to our <Link href="/terms" className="hover:text-white/40">Terms</Link> and <Link href="/privacy" className="hover:text-white/40">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
