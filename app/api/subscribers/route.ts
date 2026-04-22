import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, city, state } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const supabase = createClient()
    const { error } = await supabase.from('email_subscribers').insert({
      email,
      city: city || null,
      state: state || null,
    })

    if (error && error.code === '23505') {
      return NextResponse.json({ message: 'Already subscribed' })
    }
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Subscriber error:', err)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
