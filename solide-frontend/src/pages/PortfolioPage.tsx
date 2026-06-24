import { useState, useEffect, useMemo } from 'react'
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
  const t = translations.portfolio[lang]
  const [filter, setFilter] = useState<'all' | 'images' | 'models3d'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const projectTypes = translations.projectTypes[lang]

  useEffect(() => {
    projectsApi.list().then(r => setProjects(r.projects)).catch(() => {})
  }, [])

  const filters = [
    { key: 'all' as const, label: t.filterAll },
    { key: 'images' as const, label: t.filterImages },
    { key: 'models3d' as const, label: t.filterModels },
  ]

  // always show projects, with or without media
  const items = useMemo(() => {
    const result: { id: string; title: string; category: string; type: string; description: string; coverImage: string | null; media: { type: 'image' | 'model'; url: string }[] }[] = []
    projects.forEach(p => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return
      const images = parseList(p.images).map(u => ({ type: 'image' as const, url: u }))
      const models = parseList(p.models3d).map(u => ({ type: 'model' as const, url: u }))
      const hasImagesOrModels = images.length > 0 || models.length > 0
      let media: { type: 'image' | 'model'; url: string }[] = []
      if (filter === 'all') media = [...images, ...models]
      else if (filter === 'images') media = images
      else if (filter === 'models3d') media = models
      const coverImage = p.beforeImage || (images.length > 0 ? images[0].url : null)
      const show = filter === 'all'
        ? hasImagesOrModels || (!!p.beforeImage)
        : media.length > 0
      if (show) {
        result.push({ id: p.id, title: p.title, category: p.category, type: p.type, description: p.description, coverImage, media })
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
          </motion.div>

          {/* media type filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 text-xs tracking-[0.15em] uppercase transition-all ${
                  filter === f.key ? 'bg-gold text-obsidian' : 'text-ivory/40 border border-ivory/10 hover:border-ivory/30'
                }`}
              >{f.label}</button>
            ))}
          </div>

          {/* project type filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 text-[11px] tracking-wider transition-all ${
                typeFilter === 'all' ? 'bg-ivory/10 text-ivory' : 'text-ivory/30 border border-ivory/10 hover:border-ivory/30'
              }`}
            >{t.filterTypeAll}</button>
            {projectTypes.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-[11px] tracking-wider transition-all ${
                  typeFilter === t ? 'bg-ivory/10 text-ivory' : 'text-ivory/30 border border-ivory/10 hover:border-ivory/30'
                }`}
              >{t}</button>
            ))}
          </div>

          {/* grid */}
          <AnimatePresence mode="wait">
            <motion.div key={filter} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
            >
              {items.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }} className="break-inside-avoid"
                >
                  <div className="group relative overflow-hidden border border-ivory/5 hover:border-gold/15 transition-all bg-ivory/[0.015]">
                    {/* thumbnail from coverImage, first media, or placeholder */}
                    {item.coverImage ? (
                      <button onClick={() => setLightbox(item.media[0]?.url || item.coverImage!)} className="block w-full">
                        <img src={assetUrl(item.coverImage)}
                          alt={item.title} className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                          style={{ minHeight: 200, maxHeight: 450 }} loading="lazy" />
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center bg-ivory/[0.02] py-16">
                        <div className="text-center">
                          <div className="w-14 h-14 mx-auto mb-3 rounded-full border border-ivory/10 flex items-center justify-center text-ivory/20 text-xl font-display">
                            {item.title.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs text-ivory/20">{item.category}</p>
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-[10px] px-2 py-0.5 bg-gold/10 text-gold/70 tracking-wider">{item.type}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-ivory/5 text-ivory/40">{item.category}</span>
                      </div>
                      <h3 className="text-base font-serif text-ivory">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-ivory/50 mt-2 leading-relaxed line-clamp-3">{item.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {items.length === 0 && (
            <p className="text-center text-ivory/20 text-sm mt-16">
              {lang === 'en' ? 'No projects yet.' : 'لا توجد مشاريع بعد.'}
            </p>
          )}
        </div>
      </main>

      {/* lightbox */}
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
