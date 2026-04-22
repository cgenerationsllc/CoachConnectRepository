'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (error) {
      toast.error(error.message === 'Email not confirmed'
        ? 'Please confirm your email before signing in'
        : 'Invalid email or password')
      setLoading(false)
      return
    }
    if (data.session) {
      window.location.href = '/dashboard'
      return
    }
    toast.error('Login failed — please try again')
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="mb-7">
          <h1 className="font-display font-black text-3xl mb-2">Welcome back</h1>
          <p className="text-white/40 text-sm">Sign in to your CoachConnect account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 mt-1"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-white/35 text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-green-400 hover:underline">Sign up free</Link>
        </p>
        <p className="text-center text-white/35 text-sm mt-2">
          Are you a coach?{' '}
          <Link href="/auth/signup?role=trainer" className="text-green-400 hover:underline">
            List your profile
          </Link>
        </p>
      </div>
    </div>
  )
}