import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { category_name, reason, submitter_type } = body

    if (!category_name) return NextResponse.json({ error: 'Category name is required' }, { status: 400 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('category_suggestions').insert({
      suggested_by: user?.id || null,
      submitter_type: submitter_type || 'user',
      category_name,
      reason: reason || null,
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Suggestion error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
