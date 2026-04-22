'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, User, MessageSquare, CreditCard,
  Eye, Star, TrendingUp, AlertCircle, CheckCircle,
  ExternalLink, Clock, ArrowUp, Users
} from 'lucide-react'
import { ProfileEditor } from './ProfileEditor'
import { StarRating } from '@/components/ui/StarRating'
import { timeAgo, formatRate } from '@/lib/utils'
import { PLANS } from '@/lib/stripe'
import type { TrainerProfile, Inquiry } from '@/types'

type Tab = 'overview' | 'profile' | 'inquiries' | 'billing'

interface Props {
  trainer: TrainerProfile | null
  inquiries: Inquiry[]
  userId: string
  monthlyViews: number
  premiumAvgViews: number
  defaultTab?: string
}

export function DashboardClient({ trainer, inquiries, userId, monthlyViews, premiumAvgViews, defaultTab }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>((defaultTab as Tab) || 'overview')
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const router = useRouter()

  const unread = inquiries.filter((i) => !i.is_read).length

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'profile' as Tab, label: 'My Profile', icon: User },
    { id: 'inquiries' as Tab, label: 'Inquiries', icon: MessageSquare, badge: unread },
    { id: 'billing' as Tab, label: 'Billing', icon: CreditCard },
  ]

  const handleCheckout = async (tier: 'standard' | 'premium') => {
    if (!trainer) {
      toast.error('Please save your profile first')
      setActiveTab('profile')
      return
    }
    setCheckoutLoading(`${tier}-${billingInterval}`)
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval: billingInterval, promoCode: promoCode || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Something went wrong'); return }
      if (data.url) window.location.href = data.url
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handlePortal = async () => {
    try {
      const res = await fetch('/api/subscriptions/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || 'Failed to open billing portal')
    } catch {
      toast.error('Something went wrong')
    }
  }

  const isSubscribed = trainer && ['active', 'trialing'].includes(trainer.subscription_status)

  return (
    <div>
      {/* Tab nav */}
      <div className="flex gap-1 p-1 card rounded-2xl mb-8 w-fit">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
              activeTab === id ? 'bg-green-500 text-white' : 'text-white/45 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={14} />
            {label}
            {badge ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {!trainer ? (
            <div className="card p-10 text-center">
              <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl mb-2">Set up your coach profile</h3>
              <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                Create your profile to get listed on CoachConnect and start receiving client inquiries.
              </p>
              <button onClick={() => setActiveTab('profile')} className="btn-primary">
                Create Profile
              </button>
            </div>
          ) : (
            <>
              {/* Status card */}
              <div className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Listing Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${trainer.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="font-semibold">
                        {trainer.is_active
                          ? trainer.is_premium ? '⭐ Premium — Active' : 'Standard — Active'
                          : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-white/25 text-xs mt-1 capitalize">
                      {trainer.subscription_status}
                      {trainer.subscription_status === 'trialing' && trainer.trial_ends_at
                        ? ` · trial ends ${new Date(trainer.trial_ends_at).toLocaleDateString()}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {trainer.is_active && (
                      <Link
                        href={`/trainers/${trainer.slug}`}
                        target="_blank"
                        className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5"
                      >
                        <Eye size={13} /> View Profile <ExternalLink size={11} />
                      </Link>
                    )}
                    {!isSubscribed && (
                      <button onClick={() => setActiveTab('billing')} className="btn-primary text-sm py-2 px-4">
                        Activate Listing
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Profile views (30d)', value: monthlyViews, icon: Eye, color: 'text-green-400' },
                  { label: 'Inquiries', value: inquiries.length, icon: MessageSquare, color: 'text-blue-400' },
                  { label: 'Rating', value: trainer.average_rating > 0 ? trainer.average_rating.toFixed(1) : '—', icon: Star, color: 'text-yellow-400' },
                  { label: 'Reviews', value: trainer.review_count, icon: Users, color: 'text-purple-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="card p-5">
                    <Icon size={17} className={`${color} mb-3`} />
                    <div className="font-display text-3xl font-black mb-1">{value}</div>
                    <div className="text-white/35 text-xs">{label}</div>
                  </div>
                ))}
              </div>

              {/* Competitor comparison — only for standard plan */}
              {!trainer.is_premium && trainer.is_active && premiumAvgViews > 0 && (
                <div className="card p-6 border border-green-500/15">
                  <div className="flex items-start gap-3 mb-4">
                    <TrendingUp size={18} className="text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">How Premium coaches compare</h3>
                      <p className="text-white/40 text-sm">
                        Premium coaches in your specialty averaged <strong className="text-white">{premiumAvgViews} profile views</strong> this month.
                        You had <strong className="text-white">{monthlyViews}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Visual bar comparison */}
                  <div className="space-y-2.5 mb-4">
                    <div>
                      <div className="flex justify-between text-xs text-white/40 mb-1">
                        <span>Your views</span>
                        <span>{monthlyViews}</span>
                      </div>
                      <div className="h-2 rounded-full bg-charcoal-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-white/30 transition-all duration-700"
                          style={{ width: `${Math.min(100, premiumAvgViews > 0 ? (monthlyViews / premiumAvgViews) * 100 : 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-white/40 mb-1">
                        <span>Premium average</span>
                        <span>{premiumAvgViews}</span>
                      </div>
                      <div className="h-2 rounded-full bg-charcoal-700 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500 w-full" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setActiveTab('billing'); setBillingInterval('monthly') }}
                    className="flex items-center gap-1.5 text-sm text-green-400 hover:underline font-medium"
                  >
                    <ArrowUp size={13} /> Upgrade to Premium — from $45/month
                  </button>
                </div>
              )}

              {/* Recent inquiries preview */}
              {inquiries.length > 0 && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Recent Inquiries</h3>
                    <button onClick={() => setActiveTab('inquiries')} className="text-xs text-green-400 hover:underline">View all</button>
                  </div>
                  <div className="space-y-3">
                    {inquiries.slice(0, 3).map((inq) => (
                      <div key={inq.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center text-xs font-bold text-green-400 shrink-0">
                          {inq.sender_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm">{inq.sender_name}</span>
                            <span className="text-white/25 text-xs shrink-0">{timeAgo(inq.created_at)}</span>
                          </div>
                          <p className="text-white/40 text-xs truncate mt-0.5">{inq.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── PROFILE TAB ───────────────────────────────── */}
      {activeTab === 'profile' && (
        <ProfileEditor
          trainer={trainer}
          userId={userId}
          onSaved={() => {
            toast.success('Profile saved!')
            router.refresh()
            setActiveTab('overview')
          }}
        />
      )}

      {/* ── INQUIRIES TAB ─────────────────────────────── */}
      {activeTab === 'inquiries' && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-xl mb-6">Client Inquiries</h3>
          {inquiries.length === 0 ? (
            <div className="text-center py-12 text-white/25">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No inquiries yet. Once your profile is live, client messages will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-5 rounded-2xl bg-white/3 border border-white/5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center text-sm font-bold text-green-400">
                        {inq.sender_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{inq.sender_name}</p>
                        <a href={`mailto:${inq.sender_email}`} className="text-green-400 text-sm hover:underline">
                          {inq.sender_email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/25 text-xs shrink-0">
                      <Clock size={11} /> {timeAgo(inq.created_at)}
                    </div>
                  </div>

                  {inq.goal && (
                    <span className="inline-block mb-2 px-2.5 py-1 rounded-full text-xs bg-green-500/15 text-green-300 border border-green-500/20">
                      Goal: {inq.goal}
                    </span>
                  )}

                  <p className="text-white/65 text-sm leading-relaxed">{inq.message}</p>

                  {inq.sender_phone && (
                    <p className="text-white/35 text-xs mt-2">📞 {inq.sender_phone}</p>
                  )}

                  <a
                    href={`mailto:${inq.sender_email}?subject=Re: Your CoachConnect inquiry`}
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
                  >
                    Reply via Email
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BILLING TAB ───────────────────────────────── */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {isSubscribed && trainer?.stripe_subscription_id ? (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle size={20} className="text-green-400" />
                <h3 className="font-semibold">
                  {trainer.is_premium ? 'Premium' : 'Standard'} —{' '}
                  {trainer.subscription_status === 'trialing' ? 'Free Trial' : 'Active'}
                </h3>
              </div>
              <p className="text-white/40 text-sm mb-5">
                {trainer.subscription_status === 'trialing'
                  ? `Your free trial is active${trainer.trial_ends_at ? ` until ${new Date(trainer.trial_ends_at).toLocaleDateString()}` : ''}. Your card will be charged when it ends.`
                  : `You are billed $${trainer.is_premium ? (trainer.subscription_interval === 'yearly' ? '450' : '45') : (trainer.subscription_interval === 'yearly' ? '300' : '30')}/${trainer.subscription_interval === 'yearly' ? 'year' : 'month'}.`}
              </p>
              <button onClick={handlePortal} className="btn-secondary text-sm flex items-center gap-2">
                <CreditCard size={14} /> Manage Billing & Invoices
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h3 className="font-display font-bold text-xl mb-1">Choose Your Plan</h3>
                  <p className="text-white/40 text-sm">30-day free trial on all plans. No credit card needed to start.</p>
                </div>
                {/* Monthly / Yearly toggle */}
                <div className="flex items-center gap-1 p-1 card rounded-xl text-sm">
                  <button
                    onClick={() => setBillingInterval('monthly')}
                    className={`px-4 py-2 rounded-lg transition-all ${billingInterval === 'monthly' ? 'bg-green-500 text-white font-semibold' : 'text-white/50 hover:text-white'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingInterval('yearly')}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${billingInterval === 'yearly' ? 'bg-green-500 text-white font-semibold' : 'text-white/50 hover:text-white'}`}
                  >
                    Yearly
                    <span className="text-xs bg-amber-500 text-amber-950 font-bold px-1.5 py-0.5 rounded-full">Save</span>
                  </button>
                </div>
              </div>

              {/* Promo code */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Promo code (e.g. FOUNDING50)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="input text-sm flex-1"
                />
                {promoCode && (
                  <button onClick={() => setPromoCode('')} className="px-3 py-2 rounded-xl text-white/40 hover:text-white text-sm">
                    Clear
                  </button>
                )}
              </div>

              {/* Plan cards */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Standard */}
                <div className="card p-6 border border-white/8">
                  <h4 className="font-display font-bold text-xl mb-1">Standard</h4>
                  <p className="text-white/40 text-sm mb-4">Everything you need to get found.</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl font-black">
                      ${billingInterval === 'monthly' ? PLANS.standard.monthly.price : PLANS.standard.yearly.price}
                    </span>
                    <span className="text-white/35 text-sm">/{billingInterval === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  {billingInterval === 'yearly' && (
                    <p className="text-green-400 text-xs mb-4">Save $60 vs monthly</p>
                  )}
                  <p className="text-green-400 text-xs mb-5">30-day free trial included</p>
                  <ul className="space-y-2.5 mb-6">
                    {PLANS.standard.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                        <CheckCircle size={13} className="text-green-400 mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCheckout('standard')}
                    disabled={!!checkoutLoading}
                    className="btn-secondary w-full disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {checkoutLoading === `standard-${billingInterval}`
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Start Free Trial'}
                  </button>
                </div>

                {/* Premium */}
                <div className="card p-6 border-2 border-green-500/40 relative" style={{ background: 'linear-gradient(145deg, rgba(34,197,94,0.08) 0%, rgba(36,36,36,0.95) 60%)' }}>
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 badge-premium px-3 py-1 text-xs">
                    <Star size={10} fill="currentColor" /> Most Popular
                  </div>
                  <h4 className="font-display font-bold text-xl mb-1">Premium</h4>
                  <p className="text-white/40 text-sm mb-4">Maximum visibility.</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl font-black">
                      ${billingInterval === 'monthly' ? PLANS.premium.monthly.price : PLANS.premium.yearly.price}
                    </span>
                    <span className="text-white/35 text-sm">/{billingInterval === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  {billingInterval === 'yearly' && (
                    <p className="text-green-400 text-xs mb-4">Save $90 vs monthly</p>
                  )}
                  <p className="text-green-400 text-xs mb-5">30-day free trial included</p>
                  <ul className="space-y-2.5 mb-6">
                    {PLANS.premium.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                        <CheckCircle size={13} className="text-green-400 mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCheckout('premium')}
                    disabled={!!checkoutLoading}
                    className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {checkoutLoading === `premium-${billingInterval}`
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Start Free Trial'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
