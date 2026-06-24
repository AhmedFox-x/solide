// @ts-nocheck
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll } from 'framer-motion'
import type { Lang } from '../lib/translations'
import { translations } from '../lib/translations'
import GeometricBg from '../components/GeometricBg'
import { TiltCard } from '../components/GeometricBg'
import AppNavbar from '../components/AppNavbar'
import logo from '../assets/logo-bg.png'

export default function AboutPage() {
  const [lang, setLang] = useState<Lang>('ar')
  const t = translations.about[lang]
  const te = translations.about[lang === 'en' ? 'ar' : 'en']
  const { scrollY } = useScroll()

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-obsidian text-ivory min-h-screen" lang={lang}>
      <GeometricBg count={20} />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: '250px', backgroundRepeat: 'repeat' }}
      />
      <AppNavbar lang={lang} setLang={setLang} />

      <main className="pt-28 md:pt-36 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">{translations.navbar[lang][1]}</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-ivory mt-2 leading-[0.9]">
              {lang === 'en' ? 'Wrought' : 'فن'}<br />
              <span className="text-gold-gradient">{lang === 'en' ? 'Iron Art' : 'الحديد الكريتال'}</span>
            </h1>
          </motion.div>

          {/* content */}
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-2"
            >
              <div className="text-7xl md:text-8xl lg:text-9xl font-display text-gold/20 leading-none">18</div>
              <div className="text-xs tracking-[0.2em] uppercase text-ivory/30 -mt-2">
                {lang === 'en' ? 'Years of Precision' : 'سنوات من الدقة'}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-3 space-y-6"
            >
              <p className="text-ivory/70 text-lg leading-relaxed font-serif">
                {lang === 'en' ? t.body : te.body}
              </p>
              <p className="text-ivory/60 text-base leading-relaxed" style={{ direction: 'rtl' }}>
                {lang === 'ar' ? t.body : te.body}
              </p>
            </motion.div>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-20">
            {t.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <TiltCard className="relative h-full border border-ivory/5 bg-ivory/[0.015] px-4 py-8 md:py-10 text-center group hover:border-gold/15 transition-all">
                  <div className="relative">
                    <div className="text-3xl md:text-4xl font-display text-gold mb-1.5">{stat.value}</div>
                    <div className="text-[10px] md:text-xs text-ivory/40 tracking-[0.2em] uppercase">{stat.label}</div>
                  </div>
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
