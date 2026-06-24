import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Lang } from '../lib/translations'
import { translations } from '../lib/translations'
import { testimonialsApi } from '../lib/api'
import type { Testimonial } from '../lib/api'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import ServicesSection from '../components/ServicesSection'
import TestimonialsSection from '../components/TestimonialsSection'
import ContactSection from '../components/ContactSection'
import AppNavbar from '../components/AppNavbar'
import logo from '../assets/logo-bg.png'

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('ar')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const nav = translations.navbar[lang]

  useEffect(() => {
    testimonialsApi.list().then(r => setTestimonials(r.testimonials)).catch(() => {})
  }, [])

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-obsidian text-ivory" lang={lang}>
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: '250px', backgroundRepeat: 'repeat', zIndex: 0 }}
      />
      <AppNavbar lang={lang} setLang={setLang} />

      <main className="relative z-[1]">
        <HeroSection lang={lang} setLang={setLang} />
        <AboutSection lang={lang} />
        <ServicesSection lang={lang} />

        {/* quick links to work pages */}
        <section className="relative py-16 md:py-20 px-4">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-5">
            <Link to="/portfolio"
              className="group block border border-ivory/5 bg-ivory/[0.015] p-8 md:p-10 hover:border-gold/15 transition-all"
            >
              <div className="text-xs tracking-[0.2em] uppercase text-gold/50 mb-2">{nav[3]}</div>
              <p className="text-ivory/40 text-sm group-hover:text-ivory/60 transition-colors">
                {lang === 'en' ? 'Browse our finest steel creations' : 'تصفح أفضل إبداعاتنا الفولاذية'}
              </p>
              <div className="mt-5 h-[1px] w-0 bg-gradient-to-r from-gold/40 to-transparent group-hover:w-full transition-all duration-500" />
            </Link>
            <Link to="/videos"
              className="group block border border-ivory/5 bg-ivory/[0.015] p-8 md:p-10 hover:border-gold/15 transition-all"
            >
              <div className="text-xs tracking-[0.2em] uppercase text-gold/50 mb-2">{nav[4]}</div>
              <p className="text-ivory/40 text-sm group-hover:text-ivory/60 transition-colors">
                {lang === 'en' ? 'Watch our process in action' : 'شاهد عمليتنا على أرض الواقع'}
              </p>
              <div className="mt-5 h-[1px] w-0 bg-gradient-to-r from-gold/40 to-transparent group-hover:w-full transition-all duration-500" />
            </Link>
          </div>
        </section>

        <TestimonialsSection lang={lang} testimonials={testimonials} />
        <ContactSection lang={lang} />
      </main>

      <footer className="relative z-[1] py-10 px-4 border-t border-ivory/5">
        <div className="max-w-6xl mx-auto text-center text-ivory/20 text-xs">
          © {new Date().getFullYear()} Solide. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
        </div>
      </footer>
    </div>
  )
}
