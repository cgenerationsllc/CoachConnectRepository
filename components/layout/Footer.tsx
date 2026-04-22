import Link from 'next/link'
import { SPORTS } from '@/types'

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 mt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white font-black text-sm">CC</div>
              CoachConnect
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              Find the right coach for you. Connecting clients with verified coaches across every sport and fitness goal.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/70">For Clients</h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><Link href="/search" className="hover:text-white transition-colors">Find a Coach</Link></li>
              <li><Link href="/search?sport=Weight+Loss" className="hover:text-white transition-colors">Weight Loss</Link></li>
              <li><Link href="/search?sport=Youth+Sports" className="hover:text-white transition-colors">Youth Sports</Link></li>
              <li><Link href="/search?sport=Online+Coaching" className="hover:text-white transition-colors">Online Coaching</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/70">For Coaches</h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><Link href="/auth/signup?role=trainer" className="hover:text-white transition-colors">Create Profile</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/faq?for=trainers" className="hover:text-white transition-colors">Coach FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/70">Company</h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/25">
          <p>© {new Date().getFullYear()} CoachConnect. All rights reserved. A CGenerations LLC product.</p>
          <p>Built to connect coaches and clients who take their goals seriously.</p>
        </div>
      </div>
    </footer>
  )
}
