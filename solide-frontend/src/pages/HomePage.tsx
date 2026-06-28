import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Lang } from '../lib/translations'
import { useLang } from '../lib/useLang'
import { assetUrl } from '../lib/asset'
import { projectsApi, testimonialsApi } from '../lib/api'
import type { Project, Testimonial } from '../lib/api'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import ServicesSection from '../components/ServicesSection'
import TestimonialsSection from '../components/TestimonialsSection'
import ContactSection from '../components/ContactSection'
import AppNavbar from '../components/AppNavbar'
import logo from '../assets/logo-bg.png'

export default function HomePage() {
  const [lang, setLang] = useLang()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const location = useLocation()
  const navigate = useNavigate()
  const orderState = location.state as { orderProject?: { id: string; title: string; images: string[] } } | null
  const contactRef = useRef<HTMLDivElement>(null)
  const orderHandled = useRef(false)

  useEffect(() => {
    testimonialsApi.list().then(r => setTestimonials(r.testimonials)).catch(() => {})
    projectsApi.list().then(r => setProjects(r.projects)).catch(() => {})
  }, [])

  useEffect(() => {
    if (orderState?.orderProject && !orderHandled.current) {
      orderHandled.current = true
      navigate('.', { replace: true, state: {} })
      const el = document.getElementById('contact-form') || contactRef.current
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      const observer = new MutationObserver(() => {
        const target = document.getElementById('contact-form') || contactRef.current
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
          observer.disconnect()
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
      return () => observer.disconnect()
    }
  }, [orderState, navigate])

  const featured = projects.filter(p => p.featured).slice(0, 3)

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-obsidian text-ivory" lang={lang}>
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: '250px', backgroundRepeat: 'repeat', zIndex: 0 }}
      />
      <AppNavbar lang={lang} setLang={setLang} />

      <main className="relative z-[1]">
        <HeroSection lang={lang} setLang={setLang} />

        <AboutSection lang={lang} />
        <ServicesSection lang={lang} />

        {/* portfolio strip */}
        {featured.length > 0 && (
          <section className="py-20 md:py-28 px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <span className="text-[10px] tracking-[0.3em] uppercase text-gold/40 block mb-2">
                  {lang === 'en' ? '— Featured Works —' : '— أعمال مميزة —'}
                </span>
                <h2 className="text-3xl md:text-4xl font-display text-ivory">
                  {lang === 'en' ? 'Our latest projects' : 'أحدث مشاريعنا'}
                </h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-6">
                {featured.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Link to={`/project/${p.id}`} className="group block">
                      <div className="relative overflow-hidden border border-ivory/5">
                        <img
                          src={(() => { try { return assetUrl(JSON.parse(p.images || '[]')?.[0]) } catch { return '' } })()}
                          alt={p.title}
                          className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">
                            {p.category || (lang === 'en' ? 'Metal Work' : 'مشغولات معدنية')}
                          </span>
                          <h3 className="text-lg font-display text-ivory mt-1">{p.title}</h3>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-10 text-center"
              >
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-gold/60 hover:text-gold transition-colors border border-gold/20 hover:border-gold/40 px-6 py-3"
                >
                  {lang === 'en' ? 'View All Projects' : 'كل المشاريع'}
                  {lang === 'en' ? <ArrowRight className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* individual gallery strip */}
        {projects.length > 0 && (
          <section className="py-20 md:py-28 px-4 overflow-hidden">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-10"
              >
                <span className="text-[10px] tracking-[0.3em] uppercase text-gold/40 block mb-2">
                  {lang === 'en' ? '— Gallery —' : '— معرض —'}
                </span>
                <h2 className="text-3xl md:text-4xl font-display text-ivory">
                  {lang === 'en' ? 'Standalone Designs' : 'تصاميم فردية'}
                </h2>
              </motion.div>
              <div className="overflow-x-auto scrollbar-none -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-4 w-max pb-2">
                  {(() => {
                    const allImgs: { url: string; title: string; id: string }[] = []
                    projects.forEach(p => {
                      try {
                        const imgs = JSON.parse(p.images || '[]')
                        if (Array.isArray(imgs)) {
                          imgs.forEach((u: string) => {
                            if (allImgs.length < 20) allImgs.push({ url: u, title: p.title, id: p.id })
                          })
                        }
                      } catch {}
                    })
                    return allImgs
                  })().map((item, i) => (
                    <Link key={`${item.id}-${i}`} to={`/project/${item.id}`}
                      className="group flex-shrink-0 w-[180px] md:w-[220px] overflow-hidden border border-ivory/5 hover:border-gold/15 transition-all"
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img src={assetUrl(item.url)} alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy" />
                      </div>
                      <div className="p-3">
                        <p className="text-[11px] text-ivory/50 group-hover:text-gold transition-colors truncate">
                          {item.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <VideosSection lang={lang} />

        <TestimonialsSection lang={lang} testimonials={testimonials} />

        <div ref={contactRef} style={{ scrollMarginTop: 100 }}>
          <ContactSection lang={lang} orderProject={orderState?.orderProject || null} />
        </div>
      </main>

      <footer className="relative z-[1] pt-20 pb-10 px-4 border-t border-ivory/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-10 mb-12 text-center sm:text-left">
            <div>
              <span className="font-display text-xl tracking-[0.25em] text-ivory">SOLIDE</span>
              <p className="text-xs text-ivory/30 mt-3 leading-relaxed max-w-xs mx-auto sm:mx-0">
                {lang === 'en'
                  ? 'Premium metal craftsmanship — wrought iron art defined by design.'
                  : 'صناعة معدنية فاخرة — فن الحديد الكريتال، محدّد بالتصميم.'}
              </p>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-gold/50 mb-4">
                {lang === 'en' ? 'Quick Links' : 'روابط سريعة'}
              </h4>
              <div className="space-y-2">
                <Link to="/" className="block text-xs text-ivory/30 hover:text-gold/60 transition-colors">
                  {lang === 'en' ? 'Home' : 'الرئيسية'}
                </Link>
                <Link to="/portfolio" className="block text-xs text-ivory/30 hover:text-gold/60 transition-colors">
                  {lang === 'en' ? 'Portfolio' : 'أعمالنا'}
                </Link>
                <Link to="/videos" className="block text-xs text-ivory/30 hover:text-gold/60 transition-colors">
                  {lang === 'en' ? 'Videos' : 'فيديو'}
                </Link>
                <a href="#contact" className="block text-xs text-ivory/30 hover:text-gold/60 transition-colors">
                  {lang === 'en' ? 'Contact' : 'اتصل بنا'}
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-gold/50 mb-4">
                {lang === 'en' ? 'Connect' : 'تابعنا'}
              </h4>
              <p className="text-xs text-ivory/20 leading-relaxed">
                {lang === 'en'
                  ? 'Follow us on social media for the latest projects and updates.'
                  : 'تابعنا على وسائل التواصل الاجتماعي لأحدث المشاريع والتحديثات.'}
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-ivory/5 text-center">
            <p className="text-[10px] text-ivory/15 tracking-wider">
              &copy; {new Date().getFullYear()} SOLIDE. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function VideosSection({ lang }: { lang: Lang }) {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold/40 block mb-2">
            {lang === 'en' ? '— Video —' : '— فيديو —'}
          </span>
          <h2 className="text-3xl md:text-4xl font-display text-ivory">
            {lang === 'en' ? 'In Motion' : 'في الحركة'}
          </h2>
        </motion.div>
        <Link
          to="/videos"
          className="aspect-video max-w-3xl mx-auto border border-ivory/5 overflow-hidden flex items-center justify-center group cursor-pointer"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-gold/30 flex items-center justify-center group-hover:bg-gold/10 transition-all duration-300">
              <svg className="w-6 h-6 text-gold/60 group-hover:text-gold transition-colors ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-xs tracking-[0.2em] uppercase text-ivory/30 group-hover:text-gold transition-colors">
              {lang === 'en' ? 'Watch All Videos' : 'شاهد كل الفيديوهات'}
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}
