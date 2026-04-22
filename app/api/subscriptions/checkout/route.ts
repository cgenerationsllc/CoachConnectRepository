import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

    const user = session.user
    const body = await req.json()
    const { tier, interval, promoCode } = body as {
      tier: 'standard' | 'premium'
      interval: 'monthly' | 'yearly'
      promoCode?: string
    }

    if (!tier || !interval || !PLANS[tier] || !PLANS[tier][interval]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    const plan = PLANS[tier][interval]

    if (!plan.priceId) {
      return NextResponse.json(
        { error: `Price ID for ${tier} ${interval} plan is missing. Check your .env.local file.` },
        { status: 500 }
      )
    }

    const { data: trainer } = await supabase
      .from('trainer_profiles')
      .select('id, stripe_customer_id, display_name, slug')
      .eq('user_id', user.id)
      .single()

    if (!trainer) {
      return NextResponse.json(
        { error: 'Please save your coach profile first, then come back to billing.' },
        { status: 404 }
      )
    }

    // Create or retrieve Stripe customer
    let customerId = trainer.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { trainerId: trainer.id },
      })
      customerId = customer.id
      await supabase
        .from('trainer_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', trainer.id)
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    // Build checkout session params
    const sessionParams: any = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 30,
        metadata: { trainerId: trainer.id, tier, interval },
      },
      metadata: { trainerId: trainer.id, tier, interval },
      success_url: `${origin}/dashboard?subscription=success`,
      cancel_url: `${origin}/pricing`,
    }

    // Apply promo code if provided
    if (promoCode) {
      const promos = await stripe.promotionCodes.list({
        code: promoCode,
        active: true,
        limit: 1,
      })
      if (promos.data.length > 0) {
        sessionParams.discounts = [{ promotion_code: promos.data[0].id }]
      } else {
        return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 400 })
      }
    } else {
      sessionParams.allow_promotion_codes = true
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams)

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 })
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
