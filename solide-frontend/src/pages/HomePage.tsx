import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Lang } from '../lib/translations'
import { translations } from '../lib/translations'
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
  const [lang, setLang] = useState<Lang>('ar')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const nav = translations.navbar[lang]
  const location = useLocation()
  const orderState = location.state as { orderProject?: { id: string; title: string; images: string[] } } | null
  const contactRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    testimonialsApi.list().then(r => setTestimonials(r.testimonials)).catch(() => {})
    projectsApi.list().then(r => setProjects(r.projects)).catch(() => {})
  }, [])

  useEffect(() => {
    if (orderState?.orderProject && contactRef.current) {
      setTimeout(() => {
        contactRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 500)
    }
  }, [orderState])

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

        {/* Why Solide — stats + promise strip */}
        <section className="relative py-28 md:py-36 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent" />
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16">
              <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">{lang === 'en' ? 'Why Solide' : 'لماذا سوليد'}</span>
              <h2 className="text-3xl md:text-5xl font-display text-ivory mt-3">
                {lang === 'en' ? 'Built to Last, Designed to Impress' : 'مبنية لتدوم، مصممة لتبهر'}
              </h2>
              <div className="w-16 h-[1px] bg-gold/30 mx-auto mt-5" />
            </div>

            <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
              {[
                { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: lang === 'en' ? 'Premium Materials' : 'خامات فاخرة', desc: lang === 'en' ? 'We use only the finest metals and coatings, ensuring every piece resists time and weather.' : 'نستخدم أجود أنواع المعادن والطلاءات، لضمان تحمل القطعة للزمن والعوامل الجوية.' },
                { icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: lang === 'en' ? 'Bespoke Design' : 'تصميم حسب الطلب', desc: lang === 'en' ? 'Every project is unique. We work with you to create custom designs that reflect your vision.' : 'كل مشروع فريد من نوعه. نعمل معك لإنشاء تصاميم مخصصة تعكس رؤيتك.' },
                { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: lang === 'en' ? 'End-to-End Service' : 'خدمة متكاملة', desc: lang === 'en' ? 'From consultation to installation and maintenance, we handle everything so you can relax.' : 'من الاستشارة للتركيب والصيانة، نتحمل كل شيء عشان ترتاح.' },
              ].map((item, i) => (
                <div key={i} className="group relative border border-ivory/5 bg-ivory/[0.015] p-8 hover:border-gold/15 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <svg className="w-10 h-10 text-gold/60 mb-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  <h3 className="text-lg font-serif text-ivory mb-3">{item.title}</h3>
                  <p className="text-sm text-ivory/40 leading-relaxed">{item.desc}</p>
                  <div className="mt-5 h-[1px] w-0 bg-gradient-to-r from-gold/40 to-transparent group-hover:w-1/2 transition-all duration-700" />
                </div>
              ))}
            </div>

            {/* stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ivory/5 mt-16">
              {[
                { value: '350+', label: lang === 'en' ? 'Projects' : 'مشروع' },
                { value: '18', label: lang === 'en' ? 'Years of Excellence' : 'عام من التميز' },
                { value: '100%', label: lang === 'en' ? 'Client Satisfaction' : 'رضا العملاء' },
                { value: '24h', label: lang === 'en' ? 'Response Time' : 'زمن الاستجابة' },
              ].map((stat, i) => (
                <div key={i} className="group bg-ivory/[0.015] px-6 py-10 text-center hover:bg-gold/[0.02] transition-colors duration-500">
                  <div className="text-3xl md:text-4xl font-display text-gold mb-1">{stat.value}</div>
                  <div className="text-[10px] md:text-xs text-ivory/40 tracking-[0.2em] uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* featured showcase */}
        {featured.length > 0 && (
          <section className="relative py-28 md:py-36 px-4 overflow-hidden">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">{lang === 'en' ? 'Featured' : 'مختارات'}</span>
                <h2 className="text-3xl md:text-5xl font-display text-ivory mt-2">{lang === 'en' ? 'Masterpieces' : 'روائعنا'}</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {featured.map((p, i) => {
                  const imgs = (() => { try { const a = JSON.parse(p.images); return Array.isArray(a) ? a : [] } catch { return [] } })()
                  const cover = p.beforeImage || imgs[0] || null
                  const count = imgs.length + (p.beforeImage ? 1 : 0)
                  return (
                    <Link key={p.id} to={`/project/${p.id}`}
                      className={`group relative overflow-hidden border border-ivory/5 hover:border-gold/15 transition-all bg-ivory/[0.015] ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                    >
                      <div className={i === 0 ? 'min-h-[400px]' : 'min-h-[280px]'}>
                        {cover ? (
                          <img src={`${import.meta.env.VITE_API_URL || ''}${cover}`} alt={p.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-ivory/[0.02]">
                            <span className="text-ivory/10 text-4xl font-display">{p.title.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex gap-1.5 mb-2">
                          <span className="text-[10px] px-2 py-0.5 bg-gold/10 text-gold/70 tracking-wider">{p.type}</span>
                          {count > 1 && <span className="text-[10px] px-2 py-0.5 bg-ivory/10 text-ivory/50">+{count} {lang === 'en' ? 'photos' : 'صور'}</span>}
                        </div>
                        <h3 className="text-xl font-serif text-ivory">{p.title}</h3>
                        <p className="text-xs text-ivory/50 mt-1 line-clamp-1">{p.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* quick links */}
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

        <div ref={contactRef}>
          <ContactSection lang={lang} orderProject={orderState?.orderProject || null} />
        </div>
      </main>

      <footer className="relative z-[1] py-10 px-4 border-t border-ivory/5">
        <div className="max-w-6xl mx-auto text-center text-ivory/20 text-xs">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-[1px] bg-ivory/10" />
            <span className="font-display text-lg text-ivory/15 tracking-widest">SOLIDE</span>
            <div className="w-8 h-[1px] bg-ivory/10" />
          </div>
          © {new Date().getFullYear()} Solide. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
        </div>
      </footer>
    </div>
  )
}
