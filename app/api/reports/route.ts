import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { trainer_id, review_id, reason, details } = body

    if (!reason) return NextResponse.json({ error: 'Reason is required' }, { status: 400 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('reports').insert({
      reporter_id: user?.id || null,
      trainer_id: trainer_id || null,
      review_id: review_id || null,
      reason,
      details: details || null,
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Report error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
