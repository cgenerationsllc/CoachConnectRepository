import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInquiryNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { trainer_id, sender_name, sender_email, sender_phone, goal, message } = body

    if (!trainer_id || !sender_name || !sender_email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: trainer } = await supabase
      .from('trainer_profiles')
      .select('id, display_name, contact_email, user_id')
      .eq('id', trainer_id)
      .eq('is_active', true)
      .single()

    if (!trainer) return NextResponse.json({ error: 'Coach not found' }, { status: 404 })

    // Get sender's user id if logged in
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('inquiries').insert({
      trainer_id,
      sender_id: user?.id || null,
      sender_name,
      sender_email,
      sender_phone: sender_phone || null,
      goal: goal || null,
      message,
    })

    if (error) throw error

    // Email notification to trainer
    if (trainer.contact_email) {
      await sendInquiryNotification({
        trainerEmail: trainer.contact_email,
        trainerName: trainer.display_name,
        senderName: sender_name,
        senderEmail: sender_email,
        goal: goal || null,
        message,
      }).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Inquiry error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
