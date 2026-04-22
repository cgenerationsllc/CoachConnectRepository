import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-md">
      <div className="card p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-5">
          <Mail size={28} className="text-green-400" />
        </div>
        <h1 className="font-display font-black text-3xl mb-3">Check your email</h1>
        <p className="text-white/45 leading-relaxed mb-8">
          We sent you a confirmation link. Click it to activate your account and get started on CoachConnect.
        </p>
        <Link href="/auth/login" className="text-green-400 hover:underline text-sm">Back to sign in</Link>
      </div>
    </div>
  )
}
