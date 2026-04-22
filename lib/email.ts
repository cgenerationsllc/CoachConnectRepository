import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@coachconnect.com'
const ADMIN = process.env.ADMIN_EMAIL || 'cgenerationsllc@gmail.com'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://coachconnect.com'

// ── Send inquiry notification to trainer ──────────────────────
export async function sendInquiryNotification({
  trainerEmail, trainerName, senderName, senderEmail, goal, message,
}: {
  trainerEmail: string
  trainerName: string
  senderName: string
  senderEmail: string
  goal: string | null
  message: string
}) {
  return resend.emails.send({
    from: FROM,
    to: trainerEmail,
    subject: `New inquiry from ${senderName} — CoachConnect`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#22c55e">New Client Inquiry</h2>
        <p>Hi ${trainerName},</p>
        <p>You have a new inquiry from <strong>${senderName}</strong>.</p>
        ${goal ? `<p><strong>Their goal:</strong> ${goal}</p>` : ''}
        <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:0">${message}</p>
        </div>
        <p><strong>Reply to:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
        <a href="${SITE}/dashboard" style="display:inline-block;background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">View in Dashboard</a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #e5e5e5"/>
        <p style="color:#888;font-size:12px">CoachConnect — Find the Right Coach for You</p>
      </div>
    `,
  })
}

// ── Send trial reminder emails ────────────────────────────────
export async function sendTrialReminder({
  trainerEmail, trainerName, daysLeft,
}: {
  trainerEmail: string
  trainerName: string
  daysLeft: number
}) {
  const urgent = daysLeft <= 3
  return resend.emails.send({
    from: FROM,
    to: trainerEmail,
    subject: `${urgent ? '⚠️ ' : ''}Your CoachConnect trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:${urgent ? '#ef4444' : '#22c55e'}">Your free trial ${urgent ? 'is ending very soon' : `ends in ${daysLeft} days`}</h2>
        <p>Hi ${trainerName},</p>
        <p>Your 30-day free trial on CoachConnect ends in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.</p>
        <p>To keep your profile live and continue receiving client inquiries, choose a plan below.</p>
        <a href="${SITE}/dashboard?tab=billing" style="display:inline-block;background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Choose a Plan</a>
        <p style="margin-top:24px;color:#666">Standard: $30/month or $300/year &nbsp;|&nbsp; Premium: $45/month or $450/year</p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #e5e5e5"/>
        <p style="color:#888;font-size:12px">CoachConnect — Find the Right Coach for You</p>
      </div>
    `,
  })
}

// ── Send weekly stats email ───────────────────────────────────
export async function sendWeeklyStats({
  trainerEmail, trainerName, profileViews, inquiries, avgRating, reviewCount,
}: {
  trainerEmail: string
  trainerName: string
  profileViews: number
  inquiries: number
  avgRating: number
  reviewCount: number
}) {
  return resend.emails.send({
    from: FROM,
    to: trainerEmail,
    subject: `Your CoachConnect weekly stats`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#22c55e">Your Weekly Performance</h2>
        <p>Hi ${trainerName}, here's how your profile did this week:</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0">
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#22c55e">${profileViews}</div>
            <div style="color:#666;font-size:14px">Profile views</div>
          </div>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#22c55e">${inquiries}</div>
            <div style="color:#666;font-size:14px">New inquiries</div>
          </div>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#22c55e">${avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
            <div style="color:#666;font-size:14px">Average rating</div>
          </div>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#22c55e">${reviewCount}</div>
            <div style="color:#666;font-size:14px">Total reviews</div>
          </div>
        </div>
        <a href="${SITE}/dashboard" style="display:inline-block;background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">View Full Dashboard</a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #e5e5e5"/>
        <p style="color:#888;font-size:12px">CoachConnect — Find the Right Coach for You</p>
      </div>
    `,
  })
}

// ── Admin notification: new trainer activated ─────────────────
export async function sendAdminNewTrainerAlert({
  trainerName, trainerEmail, trainerSlug, tier,
}: {
  trainerName: string
  trainerEmail: string
  trainerSlug: string
  tier: string
}) {
  return resend.emails.send({
    from: FROM,
    to: ADMIN,
    subject: `New trainer activated: ${trainerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2>New Trainer Activated on CoachConnect</h2>
        <p><strong>Name:</strong> ${trainerName}</p>
        <p><strong>Email:</strong> ${trainerEmail}</p>
        <p><strong>Plan:</strong> ${tier}</p>
        <a href="${SITE}/trainers/${trainerSlug}" style="display:inline-block;background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px">View Profile</a>
      </div>
    `,
  })
}

// ── Annual renewal notice (15 days before) ────────────────────
export async function sendRenewalNotice({
  trainerEmail, trainerName, renewalDate, amount,
}: {
  trainerEmail: string
  trainerName: string
  renewalDate: string
  amount: number
}) {
  return resend.emails.send({
    from: FROM,
    to: trainerEmail,
    subject: `Your CoachConnect annual subscription renews on ${renewalDate}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#22c55e">Renewal Notice</h2>
        <p>Hi ${trainerName},</p>
        <p>Your annual CoachConnect subscription will automatically renew on <strong>${renewalDate}</strong> for <strong>$${amount}</strong>.</p>
        <p>No action is needed if you'd like to continue. To make changes, visit your billing dashboard.</p>
        <a href="${SITE}/dashboard?tab=billing" style="display:inline-block;background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Manage Billing</a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #e5e5e5"/>
        <p style="color:#888;font-size:12px">CoachConnect — Find the Right Coach for You</p>
      </div>
    `,
  })
}
