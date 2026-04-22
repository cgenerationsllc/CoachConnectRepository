import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen hero-bg flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-display font-bold text-2xl mb-10">
        <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center text-white font-black text-sm">CC</div>
        CoachConnect
      </Link>
      {children}
    </div>
  )
}
