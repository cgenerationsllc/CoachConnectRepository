import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: trainer } = await supabase
      .from('trainer_profiles')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single()

    if (!trainer?.stripe_customer_id) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'
    const portalSession = await createPortalSession(
      trainer.stripe_customer_id,
      `${origin}/dashboard`
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (err: any) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: err.message || 'Failed to open billing portal' }, { status: 500 })
  }
}
