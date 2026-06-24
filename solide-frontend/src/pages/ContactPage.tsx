// @ts-nocheck
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import type { Lang } from '../lib/translations'
import { translations } from '../lib/translations'
import GeometricBg from '../components/GeometricBg'
import AppNavbar from '../components/AppNavbar'
import logo from '../assets/logo-bg.png'

export default function ContactPage() {
  const [lang, setLang] = useState<Lang>('ar')
  const t = translations.contact[lang]
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error(lang === 'en' ? 'Please fill all fields' : 'الرجاء ملء جميع الحقول')
      return
    }
    setSending(true)
    try {
      await contactApi.send(form)
      toast.success(lang === 'en' ? 'Message sent!' : 'تم إرسال الرسالة')
      setForm({ name: '', email: '', message: '' })
    } catch {
      toast.error(lang === 'en' ? 'Failed to send' : 'فشل الإرسال')
    } finally {
      setSending(false)
    }
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-obsidian text-ivory min-h-screen" lang={lang}>
      <GeometricBg count={16} />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: '250px', backgroundRepeat: 'repeat' }}
      />
      <AppNavbar lang={lang} setLang={setLang} />

      <main className="pt-28 md:pt-36 pb-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* info side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          >
            <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">{translations.navbar[lang][5]}</span>
            <h1 className="text-3xl md:text-5xl font-display text-ivory mt-2 mb-6 leading-[0.95]">{t.heading}</h1>
            <p className="text-ivory/50 text-sm leading-relaxed mb-8">{t.subtitle}</p>

            <div className="space-y-5">
              <div className="flex items-center gap-4 text-ivory/40 text-sm">
                <div className="w-9 h-9 border border-ivory/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gold/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="text-ivory/60">Jeddah, Saudi Arabia</span>
              </div>
              <div className="flex items-center gap-4 text-ivory/40 text-sm">
                <div className="w-9 h-9 border border-ivory/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gold/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <span className="text-ivory/60">info@solide.sa</span>
              </div>
              <div className="flex items-center gap-4 text-ivory/40 text-sm">
                <div className="w-9 h-9 border border-ivory/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gold/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <span className="text-ivory/60">+966 XX XXX XXXX</span>
              </div>
            </div>

            {/* social */}
            <div className="mt-10 flex gap-4">
              {['Instagram', 'YouTube', 'Twitter', 'TikTok'].map(s => (
                <span key={s} className="text-[10px] tracking-[0.2em] uppercase text-ivory/20 border border-ivory/10 px-3 py-1.5 cursor-default">{s}</span>
              ))}
            </div>
          </motion.div>

          {/* form side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2">{t.name}</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-transparent border border-ivory/10 px-4 py-3 text-sm text-ivory placeholder-ivory/20 outline-none focus:border-gold/30 transition-colors"
                  placeholder={t.name} />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2">{t.email}</label>
                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-transparent border border-ivory/10 px-4 py-3 text-sm text-ivory placeholder-ivory/20 outline-none focus:border-gold/30 transition-colors"
                  placeholder={t.email} />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-ivory/30 mb-2">{t.message}</label>
                <textarea rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full bg-transparent border border-ivory/10 px-4 py-3 text-sm text-ivory placeholder-ivory/20 outline-none focus:border-gold/30 transition-colors resize-none"
                  placeholder={t.message} />
              </div>
              <Button type="submit" disabled={sending} className="!bg-gold !text-obsidian !px-8 !py-2.5 text-xs tracking-[0.2em] uppercase hover:!bg-gold/90 !rounded-none">
                {sending ? (lang === 'en' ? 'Sending...' : 'جاري الإرسال...') : t.submit}
              </Button>
            </form>
          </motion.div>
        </div>
      </main>

      <footer className="py-10 px-4 border-t border-ivory/5">
        <div className="max-w-6xl mx-auto text-center text-ivory/20 text-xs">
          © {new Date().getFullYear()} Solide. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
        </div>
      </footer>
    </div>
  )
}
