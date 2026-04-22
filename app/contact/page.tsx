'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Mail, Send, Lightbulb } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [suggestion, setSuggestion] = useState({ category_name: '', reason: '', submitter_type: 'user' })
  const [sending, setSending] = useState(false)
  const [suggesting, setSuggesting] = useState(false)

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // In production, route this through Resend to your admin email
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Message sent! We\'ll reply within 24–48 hours.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send. Please email us directly at cgenerationsllc@gmail.com')
    } finally { setSending(false) }
  }

  const handleSuggestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!suggestion.category_name.trim()) { toast.error('Category name is required'); return }
    setSuggesting(true)
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion),
      })
      if (!res.ok) throw new Error()
      toast.success('Thanks for the suggestion! We review all submissions.')
      setSuggestion({ category_name: '', reason: '', submitter_type: 'user' })
    } catch {
      toast.error('Failed to submit. Please try again.')
    } finally { setSuggesting(false) }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-3">Get in touch</p>
          <h1 className="font-display font-black text-5xl mb-3">Contact Us</h1>
          <p className="text-white/45">We respond to coach inquiries within 24 hours and user inquiries within 48 hours.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Contact form */}
          <div className="card p-7">
            <div className="flex items-center gap-2.5 mb-5">
              <Mail size={18} className="text-green-400" />
              <h2 className="font-display font-bold text-xl">Send a Message</h2>
            </div>
            <form onSubmit={handleContact} className="space-y-4">
              <div>
                <label className="label">Your Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input" placeholder="Jane Smith" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="label">Subject</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="input">
                  <option value="">Select a subject...</option>
                  <option value="Account issue">Account issue</option>
                  <option value="Billing question">Billing question</option>
                  <option value="Report a coach">Report a coach</option>
                  <option value="General question">General question</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} className="input resize-none" placeholder="Tell us what's on your mind..." />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full">
                {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={15} /> Send Message</>}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {/* Direct email */}
            <div className="card p-6">
              <h3 className="font-semibold mb-2">Prefer email?</h3>
              <a href="mailto:cgenerationsllc@gmail.com" className="text-green-400 hover:underline text-sm">cgenerationsllc@gmail.com</a>
              <p className="text-white/35 text-xs mt-2">Coaches: within 24 hours · Users: within 48 hours</p>
            </div>

            {/* Category suggestion */}
            <div className="card p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <Lightbulb size={17} className="text-green-400" />
                <h2 className="font-display font-bold text-lg">Suggest a Category</h2>
              </div>
              <p className="text-white/40 text-sm mb-4">Don't see your sport or coaching specialty listed? Suggest it and we'll review it for addition.</p>
              <form onSubmit={handleSuggestion} className="space-y-3">
                <div>
                  <label className="label">Category Name</label>
                  <input value={suggestion.category_name} onChange={(e) => setSuggestion({ ...suggestion, category_name: e.target.value })} className="input text-sm" placeholder="e.g. Rock Climbing, Gymnastics..." />
                </div>
                <div>
                  <label className="label">You are a...</label>
                  <select value={suggestion.submitter_type} onChange={(e) => setSuggestion({ ...suggestion, submitter_type: e.target.value })} className="input text-sm">
                    <option value="user">Client looking for a coach</option>
                    <option value="trainer">Coach in this specialty</option>
                  </select>
                </div>
                <div>
                  <label className="label">Why should we add it? (optional)</label>
                  <textarea value={suggestion.reason} onChange={(e) => setSuggestion({ ...suggestion, reason: e.target.value })} rows={2} className="input text-sm resize-none" placeholder="Brief reason..." />
                </div>
                <button type="submit" disabled={suggesting} className="btn-primary w-full text-sm py-2.5">
                  {suggesting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Suggestion'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
