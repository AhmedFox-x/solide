import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Lang } from '../lib/translations'
import { translations } from '../lib/translations'
import { assetUrl } from '../lib/asset'
import { projectsApi } from '../lib/api'
import type { Project } from '../lib/api'
import GeometricBg from '../components/GeometricBg'
import AppNavbar from '../components/AppNavbar'

import logo from '../assets/logo-bg.png'

function parseList(v: string | null | undefined): string[] {
  if (!v) return []
  try { const p = JSON.parse(v); return Array.isArray(p) ? p.filter(Boolean) : [] }
  catch { return [] }
}

export default function PortfolioPage() {
  const [lang, setLang] = useState<Lang>('ar')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const t = translations.portfolio[lang]
  const [filter, setFilter] = useState<'all' | 'images' | 'models3d'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const projectTypes = translations.projectTypes[lang]

  useEffect(() => {
    projectsApi.list().then(r => setProjects(r.projects)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filters = [
    { key: 'all' as const, label: t.filterAll },
    { key: 'images' as const, label: t.filterImages },
    { key: 'models3d' as const, label: t.filterModels },
  ]

  const cards = useMemo(() => {
    return projects.filter(p => typeFilter === 'all' || p.type === typeFilter)
      .filter(p => filter === 'all' ? (parseList(p.images).length > 0 || parseList(p.models3d).length > 0 || !!p.beforeImage) : true)
      .map(p => ({
        id: p.id, title: p.title, category: p.category, type: p.type,
        description: p.description,
        coverImage: p.beforeImage || (parseList(p.images)[0] || null),
        imageCount: parseList(p.images).length + (p.beforeImage ? 1 : 0) + (p.afterImage ? 1 : 0),
      }))
  }, [projects, filter, typeFilter])

  const mediaItems = useMemo(() => {
    if (filter === 'all') return []
    const result: { key: string; url: string; mediaType: string; projectTitle: string; projectId: string }[] = []
    projects.forEach(p => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return
      if (filter === 'images') {
        parseList(p.images).forEach(u => result.push({ key: `${p.id}-img-${u}`, url: u, mediaType: 'image', projectTitle: p.title, projectId: p.id }))
      } else if (filter === 'models3d') {
        parseList(p.models3d).forEach(u => result.push({ key: `${p.id}-mdl-${u}`, url: u, mediaType: 'model', projectTitle: p.title, projectId: p.id }))
      }
    })
    return result
  }, [projects, filter, typeFilter])

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-obsidian text-ivory min-h-screen" lang={lang}>
      <GeometricBg count={18} />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: '250px', backgroundRepeat: 'repeat' }}
      />
      <AppNavbar lang={lang} setLang={setLang} />

      <main className="pt-28 md:pt-36 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">{translations.navbar[lang][3]}</span>
            <h1 className="text-3xl md:text-5xl font-display text-ivory mt-2">{t.heading}</h1>
            <p className="text-sm text-ivory/30 mt-3 max-w-xl">
              {lang === 'ar' ? 'تصفح مجموعتنا من التصاميم الحصرية. اختر ما يناسبك ونحن ننفذه لك بأعلى جودة.' : 'Browse our exclusive collection of designs. Choose what suits you and we will execute it with the highest quality.'}
            </p>
          </motion.div>

          {/* filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 text-xs tracking-[0.15em] uppercase transition-all ${
                  filter === f.key ? 'bg-gold text-obsidian' : 'text-ivory/40 border border-ivory/10 hover:border-ivory/30'
                }`}
              >{f.label}</button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            <button onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 text-[11px] tracking-wider transition-all ${
                typeFilter === 'all' ? 'bg-ivory/10 text-ivory' : 'text-ivory/30 border border-ivory/10 hover:border-ivory/30'
              }`}
            >{t.filterTypeAll}</button>
            {projectTypes.map(ty => (
              <button key={ty} onClick={() => setTypeFilter(ty)}
                className={`px-3 py-1 text-[11px] tracking-wider transition-all ${
                  typeFilter === ty ? 'bg-ivory/10 text-ivory' : 'text-ivory/30 border border-ivory/10 hover:border-ivory/30'
                }`}
              >{ty}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {filter === 'all' ? (
              <motion.div key="all" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {cards.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Link to={`/project/${item.id}`}
                      className="group relative block border border-ivory/5 hover:border-gold/15 transition-all duration-500 bg-ivory/[0.015] h-full"
                    >
                      {/* image */}
                      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                        {item.coverImage ? (
                          <>
                            <img src={assetUrl(item.coverImage)}
                              alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-ivory/[0.02]">
                            <div className="text-center">
                              <div className="w-14 h-14 mx-auto mb-3 rounded-full border border-ivory/10 flex items-center justify-center text-ivory/20 text-xl font-display">
                                {item.title.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-xs text-ivory/20">{item.category}</p>
                            </div>
                          </div>
                        )}

                        {/* image count badge */}
                        {item.imageCount > 1 && item.coverImage && (
                          <div className="absolute top-3 right-3 bg-obsidian/70 backdrop-blur-sm px-2 py-0.5 text-[10px] text-ivory/60 tracking-wider border border-ivory/10">
                            +{item.imageCount - 1}
                          </div>
                        )}

                        {/* quick view overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <span className="bg-obsidian/80 backdrop-blur-sm border border-gold/30 text-gold text-[10px] tracking-[0.2em] uppercase px-5 py-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            {lang === 'ar' ? 'عرض التصميم' : 'View Design'}
                          </span>
                        </div>
                      </div>

                      {/* info */}
                      <div className="p-4">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="text-[10px] px-2 py-0.5 bg-gold/10 text-gold/70 tracking-wider">{item.type}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-ivory/5 text-ivory/40">{item.category}</span>
                        </div>
                        <h3 className="text-sm font-serif text-ivory group-hover:text-gold transition-colors duration-300">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-ivory/40 mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
                        )}

                        {/* order hint */}
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] tracking-wider text-gold/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="w-4 h-[1px] bg-gold/40" />
                          <span>{lang === 'ar' ? 'اطلب التصميم' : 'Order this design'}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key={filter} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
              >
                {mediaItems.map((item) => (
                  <motion.div key={item.key} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }} className="break-inside-avoid"
                  >
                    <div className="group relative overflow-hidden border border-ivory/5 hover:border-gold/15 transition-all bg-ivory/[0.015]">
                      {item.mediaType === 'image' ? (
                        <button onClick={() => setLightbox(item.url)} className="block w-full">
                          <img src={assetUrl(item.url)}
                            alt={item.projectTitle} className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                            style={{ minHeight: 200, maxHeight: 450 }} loading="lazy" />
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-center bg-ivory/[0.02] py-16">
                          <div className="text-center">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-full border border-ivory/10 flex items-center justify-center text-ivory/20">
                              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                              </svg>
                            </div>
                            <p className="text-xs text-ivory/40 font-serif">{item.projectTitle}</p>
                            <p className="text-[10px] text-ivory/20 mt-1">3D Model</p>
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        <Link to={`/project/${item.projectId}`}
                          className="text-sm font-serif text-ivory/70 hover:text-gold transition-colors"
                        >{item.projectTitle}</Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex justify-center items-center mt-24">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : filter === 'all' && cards.length === 0 || filter !== 'all' && mediaItems.length === 0 ? (
            <p className="text-center text-ivory/20 text-sm mt-16">
              {lang === 'en' ? 'No projects yet.' : 'لا توجد مشاريع بعد.'}
            </p>
          ) : null}
        </div>
      </main>

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.img key={lightbox} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={assetUrl(lightbox)} alt=""
              className="max-w-full max-h-[90vh] object-contain" />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-10 px-4 border-t border-ivory/5">
        <div className="max-w-6xl mx-auto text-center text-ivory/20 text-xs">
          © {new Date().getFullYear()} Solide. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
        </div>
      </footer>
    </div>
  )
}
