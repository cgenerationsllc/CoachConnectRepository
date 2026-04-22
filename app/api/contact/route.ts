import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@coachconnect.com',
      to: process.env.ADMIN_EMAIL || 'cgenerationsllc@gmail.com',
      replyTo: email,
      subject: `CoachConnect Contact: ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2>New Contact Message</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin-top:16px">
            <p style="margin:0">${message}</p>
          </div>
          <p style="color:#888;font-size:12px;margin-top:24px">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
