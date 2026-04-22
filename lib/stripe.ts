import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export const PLANS = {
  standard: {
    monthly: {
      name: 'Standard — Monthly',
      price: 30,
      priceId: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID!,
      interval: 'monthly' as const,
    },
    yearly: {
      name: 'Standard — Yearly',
      price: 300,
      priceId: process.env.STRIPE_STANDARD_YEARLY_PRICE_ID!,
      interval: 'yearly' as const,
      savings: 60,
    },
    features: [
      'Full coach profile page',
      'Listed in all search results',
      'Client reviews & star ratings',
      'Inquiry contact form',
      'Profile view analytics',
      'At least one contact method shown',
    ],
  },
  premium: {
    monthly: {
      name: 'Premium — Monthly',
      price: 45,
      priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
      interval: 'monthly' as const,
    },
    yearly: {
      name: 'Premium — Yearly',
      price: 450,
      priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
      interval: 'yearly' as const,
      savings: 90,
    },
    features: [
      'Everything in Standard',
      'First in search results (within sort)',
      'Featured on homepage',
      'One-sentence bio on search card',
      'Premium badge on profile',
      'Competitor traffic comparison',
    ],
  },
}

export async function createOrRetrieveCustomer(email: string, trainerId: string): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0].id
  const customer = await stripe.customers.create({ email, metadata: { trainerId } })
  return customer.id
}

export async function createCheckoutSession({
  customerId, priceId, trainerId, promoCode, successUrl, cancelUrl,
}: {
  customerId: string
  priceId: string
  trainerId: string
  promoCode?: string
  successUrl: string
  cancelUrl: string
}) {
  const params: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 30,
      metadata: { trainerId },
    },
    metadata: { trainerId },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: !promoCode,
  }
  if (promoCode) {
    const promos = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 })
    if (promos.data.length > 0) {
      params.discounts = [{ promotion_code: promos.data[0].id }]
    }
  }
  return stripe.checkout.sessions.create(params)
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl })
}
