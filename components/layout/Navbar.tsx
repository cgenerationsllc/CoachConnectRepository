'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-charcoal-950/95 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white font-black text-sm">CC</div>
          <span>CoachConnect</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/search" className="text-white/60 hover:text-white transition-colors">Find a Coach</Link>
          <Link href="/pricing" className="text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" className="text-white/60 hover:text-white transition-colors">About</Link>
          {user ? (
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">Dashboard</Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-white/60 hover:text-white transition-colors">Sign In</Link>
              <Link href="/auth/signup?role=trainer" className="btn-primary text-sm py-2 px-4">List Your Profile</Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-charcoal-900 border-t border-white/5 px-4 py-5 flex flex-col gap-3">
          <Link href="/search" className="text-white/70 hover:text-white py-2 text-sm" onClick={() => setOpen(false)}>Find a Coach</Link>
          <Link href="/pricing" className="text-white/70 hover:text-white py-2 text-sm" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/about" className="text-white/70 hover:text-white py-2 text-sm" onClick={() => setOpen(false)}>About</Link>
          {user ? (
            <Link href="/dashboard" className="btn-primary text-sm text-center" onClick={() => setOpen(false)}>Dashboard</Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-white/70 hover:text-white py-2 text-sm" onClick={() => setOpen(false)}>Sign In</Link>
              <Link href="/auth/signup?role=trainer" className="btn-primary text-sm text-center" onClick={() => setOpen(false)}>List Your Profile — Free Trial</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
