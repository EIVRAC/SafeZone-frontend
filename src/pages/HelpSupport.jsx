import { useState } from 'react'
import { Mail, Phone, MessageCircle, Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useToast } from '../context/ToastContext'

const FAQS = [
  { q: 'How do I report a hazard?', a: 'Go to Reports → Create Report, fill in the details, drop a pin on the map, and submit. You can attach a photo for evidence.' },
  { q: 'How do I know if my report was addressed?', a: 'Track the status on the My Reports page. Status moves from Pending → In Progress / Under Review → Resolved.' },
  { q: 'Who resolves hazard reports?', a: 'Reports are routed to the responsible agency based on category, e.g. Public Works for road damage.' },
  { q: 'Can I edit or delete my report?', a: 'Only administrators can edit or delete reports once submitted to keep the audit trail accurate. Contact support if you made an error.' },
]

export default function HelpSupport() {
  const toast = useToast()
  const [form, setForm] = useState({ subject: '', message: '' })
  const [busy, setBusy] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setTimeout(() => {
      toast.success('Message sent — our team will get back to you soon.')
      setForm({ subject: '', message: '' })
      setBusy(false)
    }, 600)
  }

  return (
    <>
      <PageHeader title="Help & Support" subtitle="Frequently asked questions and ways to reach us" />

      <div className="dash-grid">
        <div className="card">
          <h3>Frequently asked questions</h3>
          <div className="faq-list">
            {FAQS.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Contact support</h3>
          <div className="contact-list">
            <div><Mail size={16} /> support@safezone.gov</div>
            <div><Phone size={16} /> 09551623150</div>
            <div><MessageCircle size={16} /> Live chat, Mon–Fri, 8am–5pm</div>
          </div>
          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <label className="field">
              <span>Subject</span>
              <input required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </label>
            <label className="field">
              <span>Message</span>
              <textarea required rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? <Loader2 className="spin" size={16} /> : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
