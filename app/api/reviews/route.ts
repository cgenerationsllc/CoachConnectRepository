import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { trainer_id, reviewer_name, rating, title, body: reviewBody } = body

    if (!trainer_id || !reviewer_name || !rating || !reviewBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to leave a review' }, { status: 401 })
    }

    // Verify user has contacted this trainer
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('id')
      .eq('trainer_id', trainer_id)
      .eq('sender_id', user.id)
      .limit(1)
      .single()

    if (!inquiry) {
      return NextResponse.json(
        { error: 'You can only review coaches you have contacted through CoachConnect' },
        { status: 403 }
      )
    }

    // Check they haven't already reviewed
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('trainer_id', trainer_id)
      .eq('reviewer_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this coach' }, { status: 409 })
    }

    const { error } = await supabase.from('reviews').insert({
      trainer_id,
      reviewer_id: user.id,
      inquiry_id: inquiry.id,
      reviewer_name,
      rating,
      title: title || null,
      body: reviewBody,
      is_verified: true,
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Review error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Trainer responds to a review
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { review_id, response } = body

    if (!review_id || !response) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify user owns the trainer profile for this review
    const { data: review } = await supabase
      .from('reviews')
      .select('trainer_id, trainer_response')
      .eq('id', review_id)
      .single()

    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    // Check already responded
    if (review.trainer_response) {
      return NextResponse.json({ error: 'You have already responded to this review' }, { status: 409 })
    }

    const { data: trainer } = await supabase
      .from('trainer_profiles')
      .select('id')
      .eq('id', review.trainer_id)
      .eq('user_id', user.id)
      .single()

    if (!trainer) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { error } = await supabase
      .from('reviews')
      .update({ trainer_response: response, trainer_response_at: new Date().toISOString() })
      .eq('id', review_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Review response error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
