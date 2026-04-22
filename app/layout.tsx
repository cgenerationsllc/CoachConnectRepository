import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'CoachConnect', template: '%s | CoachConnect' },
  description: 'Find the right coach for you. Browse verified personal trainers across every sport and fitness goal.',
  keywords: ['personal trainer', 'fitness coach', 'sports coach', 'find a trainer', 'CoachConnect'],
  openGraph: {
    title: 'CoachConnect — Find the Right Coach for You',
    description: 'Browse verified coaches for every goal.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-charcoal-950 text-white antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#242424',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
