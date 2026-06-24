import { useEffect, useState } from 'react'
import { ticketsApi } from '../../lib/api'
import type { Ticket } from '../../lib/api'
import { Mail, Trash2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

function formatWhatsApp(text: string, name: string): string {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `• ${l}`)
    .join('\n')
  return `*📍 Solide | رد على استفسارك*\n\n┌─────────────────────\n│\n│  اهلاً *${name}*،\n│  تشكر على تواصلك معانا ❤️\n│\n└─────────────────────\n\n*رسالتنا:*\n${lines}\n\n━━━━━━━━━━━━━━━━━\n\n*فريق Solide* 🌟\n_للتواصل المباشر_`
}

function formatEmail(text: string, name: string): string {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `  • ${l}`)
    .join('\n')
  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Solide Egypt | رد على استفسارك

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  عزيزي/عزيزتي ${name}،

  شكراً لتواصلك مع فريق Solide.
  يسعدنا نقدم لك الرد التالي:

${lines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  مع تحيات،
  فريق Solide
  contact@solide.com
  solide-eg.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`}

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [response, setResponse] = useState('')

  const load = () => {
    ticketsApi.list()
      .then(r => setTickets(r.tickets))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleRespond = async () => {
    if (!response.trim() || !selected) return
    try {
      await ticketsApi.update(selected.id, { response: response.trim(), status: 'resolved' })
      toast.success('Response sent')
      setSelected(null); setResponse(''); load()
    } catch (err: any) { toast.error(err.message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await ticketsApi.delete(id); toast.success('Deleted'); load() }
    catch (e: any) { toast.error(e.message) }
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-white/40 text-sm py-16 justify-center">
      <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /> Loading...
    </div>
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">Tickets</h1>
        <p className="text-sm text-white/40 mt-0.5">{tickets.length} total</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* list */}
        <div className="lg:col-span-2 space-y-2">
          {tickets.length === 0 && (
            <p className="text-white/20 text-sm py-16 text-center">No tickets yet.</p>
          )}
          {tickets.map(t => (
            <div
              key={t.id}
              onClick={() => { setSelected(t); setResponse(t.response || '') }}
              className={`bg-white/[0.02] border rounded-xl p-4 cursor-pointer transition-all hover:border-white/20 ${
                selected?.id === t.id ? 'border-gold/40' : 'border-white/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm text-white/80 font-medium truncate">{t.subject}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                      t.status === 'open' ? 'bg-amber-500/10 text-amber-400'
                      : t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-white/5 text-white/40'
                    }`}>{t.status}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{t.name} · {t.email}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(t.id) }}
                  className="p-1 text-white/20 hover:text-red-400 transition-colors shrink-0 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-white/50 mt-2 line-clamp-2">{t.message}</p>
            </div>
          ))}
        </div>

        {/* detail / reply */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 lg:sticky lg:top-24 self-start">
          {selected ? (
            <div className="space-y-4">
              <h3 className="text-sm text-white/80 font-medium">{selected.subject}</h3>
              <div className="text-xs text-white/40 space-y-1">
                <p><span className="text-white/30">From:</span> {selected.name}</p>
                <p><span className="text-white/30">Email:</span> {selected.email}</p>
                {selected.phone && <p><span className="text-white/30">Phone:</span> {selected.phone}</p>}
                <p><span className="text-white/30">Type:</span> {selected.type}</p>
                <p>
                  <span className="text-white/30">Contact via:</span>{' '}
                  <span className={selected.preferredContact === 'whatsapp' ? 'text-emerald-400' : 'text-sky-400'}>
                    {selected.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Email'}
                  </span>
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-3 text-sm text-white/70">
                {selected.message}
              </div>

              {selected.response && (
                <div>
                  <p className="text-[10px] text-emerald-400 tracking-wider uppercase mb-1">Response</p>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-sm text-white/70">
                    {selected.response}
                  </div>
                </div>
              )}

              <textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                rows={3}
                placeholder="Write your response..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-gold/50 focus:outline-none transition-colors resize-none"
              />

              {/* reply actions */}
              <div className="flex flex-col gap-2">
                {selected.preferredContact === 'whatsapp' && selected.phone ? (
                  <button
                    onClick={async () => {
                      if (!response.trim()) return toast.error('Write a response first')
                      const raw = response.trim()
                      const num = (selected.phone ?? '').replace(/[^0-9]/g, '').replace(/^0+/, '')
                      const waText = formatWhatsApp(raw, selected.name)
                      await ticketsApi.update(selected.id, { response: raw, status: 'resolved' })
                      toast.success('Response sent via WhatsApp')
                      setSelected(null); setResponse(''); load()
                      window.location.href = `https://wa.me/20${num}?text=${encodeURIComponent(waText)}`
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-medium text-sm hover:bg-emerald-500/20 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    أرسل الرد عبر واتساب
                  </button>
                ) : selected.preferredContact === 'email' ? (
                  <button
                    onClick={async () => {
                      if (!response.trim()) return toast.error('Write a response first')
                      const raw = response.trim()
                      const emailBody = formatEmail(raw, selected.name)
                      const subj = `Re: ${selected.subject} — Solide Support`
                      await ticketsApi.update(selected.id, { response: raw, status: 'resolved' })
                      toast.success('Response sent via Email')
                      setSelected(null); setResponse(''); load()
                      window.location.href = `mailto:${selected.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(emailBody)}`
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400 font-medium text-sm hover:bg-sky-500/20 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4l-10 8L2 4" />
                    </svg>
                    أرسل الرد عبر البريد
                  </button>
                ) : null}

                <button
                  onClick={handleRespond}
                  className="flex items-center justify-center gap-1.5 py-2 bg-white/5 border border-white/10 rounded-lg text-white/40 text-xs hover:text-white/60 hover:border-white/20 transition-all"
                >
                  <MessageSquare className="w-3 h-3" />
                  Save & Resolve Only
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/20 py-12">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a ticket to reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
