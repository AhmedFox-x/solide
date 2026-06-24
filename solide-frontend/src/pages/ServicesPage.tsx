// @ts-nocheck
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import type { Lang } from '../lib/translations'
import { translations } from '../lib/translations'
import GeometricBg from '../components/GeometricBg'
import { TiltCard } from '../components/GeometricBg'
import AppNavbar from '../components/AppNavbar'
import logo from '../assets/logo-bg.png'

const ICONS = [
  'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  'M14 3v4a1 1 0 001 1h4M5 12h14M7 16h10M7 20h6',
  'M12 21a9 9 0 100-18 9 9 0 000 18zM8 14s1.5 2 4 2 4-2 4-2',
  'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z',
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'M2 20L12 2 22 20H2z',
]

export default function ServicesPage() {
  const [lang, setLang] = useState<Lang>('ar')
  const t = translations.services[lang]
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-obsidian text-ivory min-h-screen" lang={lang}>
      <GeometricBg count={20} />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: '250px', backgroundRepeat: 'repeat' }}
      />
      <AppNavbar lang={lang} setLang={setLang} />

      <main ref={ref} className="pt-28 md:pt-36 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">{translations.navbar[lang][2]}</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display text-ivory mt-2 leading-[0.95]">{t.heading}</h1>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {t.items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <TiltCard className="group relative h-full border border-ivory/5 bg-ivory/[0.015] p-6 md:p-8 hover:border-gold/15 transition-all overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-10 h-10 mb-5 text-gold/60 group-hover:text-gold transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d={ICONS[i % ICONS.length]} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-serif text-ivory mb-2">{item.title}</h3>
                  <p className="text-sm text-ivory/40 leading-relaxed group-hover:text-ivory/60 transition-colors">{item.desc}</p>
                  <div className="mt-6 h-[1px] w-0 bg-gradient-to-r from-gold/40 to-transparent group-hover:w-full transition-all duration-700" />
                </TiltCard>
              </motion.div>
            ))}
          </div>
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
