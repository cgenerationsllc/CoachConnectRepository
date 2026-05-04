import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { goal, fitness_level, preference, city, sport, limitations } = body

    if (!goal || !fitness_level) {
      return NextResponse.json({ error: 'Goal and fitness level are required' }, { status: 400 })
    }

    const supabase = createClient()

    // Build query based on user preferences
    let query = supabase
      .from('trainer_profiles')
      .select('id, display_name, slug, profile_image_url, average_rating, review_count, city, state, sports, goals, bio, remote_available')
      .eq('is_active', true)
      .limit(20)

    // Filter by sport if specified
    if (sport) {
      query = query.contains('sports', [sport])
    }

    // Filter by city if specified
    if (city) {
      if (preference === 'Online / remote coaching') {
        query = query.eq('remote_available', true)
      } else {
        query = query.or(`city.ilike.%${city}%,remote_available.eq.true`)
      }
    }

    // Filter by goal
    if (goal) {
      query = query.contains('goals', [goal])
    }

    // Order by premium first then rating
    query = query
      .order('is_premium', { ascending: false })
      .order('average_rating', { ascending: false })

    const { data: coaches } = await query

    if (!coaches || coaches.length === 0) {
      // Try broader search without goal filter
      const { data: broadCoaches } = await supabase
        .from('trainer_profiles')
        .select('id, display_name, slug, profile_image_url, average_rating, review_count, city, state, sports, goals, bio, remote_available')
        .eq('is_active', true)
        .order('is_premium', { ascending: false })
        .order('average_rating', { ascending: false })
        .limit(10)

      if (!broadCoaches || broadCoaches.length === 0) {
        return NextResponse.json({ matches: [] })
      }

      // Use AI to explain why each coach matches
      const matches = await generateAIReasons(broadCoaches.slice(0, 3), { goal, fitness_level, preference, city, sport, limitations })
      return NextResponse.json({ matches })
    }

    // Use AI to explain why each coach matches
    const matches = await generateAIReasons(coaches.slice(0, 3), { goal, fitness_level, preference, city, sport, limitations })
    return NextResponse.json({ matches })

  } catch (err: any) {
    console.error('AI coach finder error:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}

async function generateAIReasons(coaches: any[], userProfile: any) {
  const { goal, fitness_level, preference, city, sport, limitations } = userProfile

  const coachDescriptions = coaches.map((c, i) =>
    `Coach ${i + 1}: ${c.display_name}
    - Sports: ${c.sports?.join(', ') || 'General fitness'}
    - Goals: ${c.goals?.join(', ') || 'Various'}
    - Location: ${c.city || 'Remote'}, ${c.state || ''}
    - Remote available: ${c.remote_available ? 'Yes' : 'No'}
    - Rating: ${c.average_rating || 'No reviews yet'}
    - Bio: ${c.bio?.slice(0, 150) || 'No bio'}`
  ).join('\n\n')

  const prompt = `You are a fitness coach matching assistant for CoachConnect.

A user is looking for a coach with these needs:
- Main goal: ${goal}
- Fitness level: ${fitness_level}
- Preference: ${preference || 'No preference'}
- City: ${city || 'Not specified'}
- Sport interest: ${sport || 'Not specified'}
- Limitations: ${limitations || 'None'}

Here are the coaches available:

${coachDescriptions}

For each coach, write ONE short sentence (max 20 words) explaining specifically why they are a good match for this user's goal and situation. Be specific and encouraging. Do not be generic.

Respond with ONLY a JSON array like this, no other text:
[
  {"index": 0, "reason": "your reason here"},
  {"index": 1, "reason": "your reason here"},
  {"index": 2, "reason": "your reason here"}
]`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || '[]'
    const clean = text.replace(/```json|```/g, '').trim()
    const reasons = JSON.parse(clean)

    return coaches.map((coach, i) => ({
      ...coach,
      ai_reason: reasons.find((r: any) => r.index === i)?.reason || `${coach.display_name} specializes in ${coach.sports?.[0] || 'fitness'} and can help you ${goal.toLowerCase()}.`,
    }))
  } catch {
    // If AI fails, return coaches with generic reasons
    return coaches.map((coach) => ({
      ...coach,
      ai_reason: `${coach.display_name} specializes in ${coach.sports?.[0] || 'fitness coaching'} and can help you ${goal.toLowerCase()}.`,
    }))
  }
}
