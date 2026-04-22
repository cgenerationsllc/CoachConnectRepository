import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendAdminNewTrainerAlert } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as any
        const trainerId = session.metadata?.trainerId
        const tier = session.metadata?.tier as 'standard' | 'premium' || 'standard'
        const interval = session.metadata?.interval as 'monthly' | 'yearly' || 'monthly'
        if (!trainerId) break

        const sub = await stripe.subscriptions.retrieve(session.subscription as string)

        await supabase
          .from('trainer_profiles')
          .update({
            subscription_status: sub.status,
            subscription_tier: tier,
            subscription_interval: interval,
            stripe_subscription_id: sub.id,
            is_active: true,
            is_premium: tier === 'premium',
            trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          })
          .eq('id', trainerId)

        // Get trainer info and send admin alert
        const { data: trainer } = await supabase
          .from('trainer_profiles')
          .select('display_name, slug, contact_email, user_id')
          .eq('id', trainerId)
          .single()

        if (trainer) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', trainer.user_id)
            .single()

          await sendAdminNewTrainerAlert({
            trainerName: trainer.display_name,
            trainerEmail: profile?.email || trainer.contact_email || 'unknown',
            trainerSlug: trainer.slug,
            tier: `${tier} (${interval})`,
          }).catch(console.error)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const tier = (sub.metadata?.tier as 'standard' | 'premium') || 'standard'
        const interval = (sub.metadata?.interval as 'monthly' | 'yearly') || 'monthly'
        const isActive = ['active', 'trialing'].includes(sub.status)

        const { data: trainer } = await supabase
          .from('trainer_profiles')
          .select('id')
          .eq('stripe_subscription_id', sub.id)
          .single()

        if (trainer) {
          await supabase
            .from('trainer_profiles')
            .update({
              subscription_status: sub.status,
              subscription_tier: isActive ? tier : 'none',
              subscription_interval: interval,
              is_active: isActive,
              is_premium: isActive && tier === 'premium',
              trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
            })
            .eq('id', trainer.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const { data: trainer } = await supabase
          .from('trainer_profiles')
          .select('id')
          .eq('stripe_subscription_id', sub.id)
          .single()

        if (trainer) {
          await supabase
            .from('trainer_profiles')
            .update({
              subscription_status: 'canceled',
              subscription_tier: 'none',
              is_active: false,
              is_premium: false,
            })
            .eq('id', trainer.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const { data: trainer } = await supabase
          .from('trainer_profiles')
          .select('id')
          .eq('stripe_customer_id', invoice.customer as string)
          .single()

        if (trainer) {
          await supabase
            .from('trainer_profiles')
            .update({ subscription_status: 'past_due' })
            .eq('id', trainer.id)
        }
        break
      }

      // 15-day annual renewal notice handled separately via a cron job
    }

    // Log event
    await supabase.from('subscription_events').insert({
      trainer_id: (event.data.object as any).metadata?.trainerId || null,
      stripe_event_id: event.id,
      event_type: event.type,
      data: event.data.object as any,
    }).then(() => {})

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}
