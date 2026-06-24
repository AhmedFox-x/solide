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

function parseVideos(v: string | null | undefined): { url: string; thumbnail?: string }[] {
  if (!v) return []
  try {
    const p = JSON.parse(v)
    if (!Array.isArray(p)) return []
    return p.filter(Boolean).map((item: any) => {
      if (typeof item === 'string') return { url: item }
      return { url: item.url, thumbnail: item.thumbnail }
    })
  } catch { return [] }
}

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function VideosPage() {
  const [lang, setLang] = useState<Lang>('ar')
  const [projects, setProjects] = useState<Project[]>([])
  const t = translations.videos[lang]
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [videoError, setVideoError] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const projectTypes = translations.projectTypes[lang]

  useEffect(() => {
    projectsApi.list().then(r => setProjects(r.projects)).catch(() => {})
  }, [])

  const items = useMemo(() => {
    const result: { id: string; title: string; category: string; type: string; description: string; coverImage: string | null; videos: { url: string; thumbnail?: string }[] }[] = []
    projects.forEach(p => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return
      const vids = parseVideos(p.videos)
      if (vids.length === 0) return
      const images = parseList(p.images)
      const coverImage = p.beforeImage || (images.length > 0 ? images[0] : null)
      result.push({ id: p.id, title: p.title, category: p.category, type: p.type, description: p.description, coverImage, videos: vids })
    })
    return result
  }, [projects, typeFilter])

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
            <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">{translations.navbar[lang][4]}</span>
            <h1 className="text-3xl md:text-5xl font-display text-ivory mt-2">{t.heading}</h1>
          </motion.div>

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

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="group border border-ivory/5 hover:border-gold/15 transition-all bg-ivory/[0.015]"
              >
                {item.videos.length > 0 ? (
                  <button onClick={() => setActiveVideo(item.videos[0].url)} className="block w-full relative overflow-hidden">
                    <div className="aspect-video bg-ivory/[0.03] flex items-center justify-center relative">
                      {/* show video-specific thumbnail or cover image */}
                      {item.videos[0].thumbnail ? (
                        <img src={assetUrl(item.videos[0].thumbnail)}
                          alt={item.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      ) : item.coverImage ? (
                        <img src={assetUrl(item.coverImage)}
                          alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-60" loading="lazy" />
                      ) : null}
                      <div className="relative z-10 w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:border-gold/50 transition-all group-hover:scale-110 group-hover:bg-gold/10 backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white/70 group-hover:text-gold ml-0.5 transition-all" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ) : item.coverImage ? (
                  <div className="relative aspect-video bg-ivory/[0.02] overflow-hidden">
                    <img src={assetUrl(item.coverImage)}
                      alt={item.title} className="w-full h-full object-cover opacity-40" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-ivory/30 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                          <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 10l4 2-4 2z" />
                        </svg>
                        <p className="text-[10px] text-ivory/40">{lang === 'en' ? 'No video' : 'لا يوجد فيديو'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-ivory/[0.02] flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-ivory/10 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 10l4 2-4 2z" />
                      </svg>
                      <p className="text-[10px] text-ivory/20">{lang === 'en' ? 'No video' : 'لا يوجد فيديو'}</p>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="text-[10px] px-2 py-0.5 bg-gold/10 text-gold/70 tracking-wider">{item.type}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-ivory/5 text-ivory/40">{item.category}</span>
                  </div>
                  <h3 className="text-sm font-serif text-ivory">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-ivory/50 mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {items.length === 0 && (
            <p className="text-center text-ivory/20 text-sm mt-16">
              {lang === 'en' ? 'No projects yet.' : 'لا توجد مشاريع بعد.'}
            </p>
          )}
        </div>
      </main>

      {/* video modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setActiveVideo(null); setVideoError(false) }}
            className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-4xl aspect-video relative"
            >
              {getYouTubeId(activeVideo) ? (
                <iframe className="w-full h-full rounded-lg" src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo)}?autoplay=1`}
                  allow="autoplay; encrypted-media" allowFullScreen />
              ) : videoError ? (
                <div className="w-full h-full rounded-lg bg-black/60 flex items-center justify-center text-ivory/40 text-sm">
                  <div className="text-center">
                    <svg className="w-10 h-10 mx-auto mb-3 text-ivory/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                    </svg>
                    {lang === 'en' ? 'Video format not supported' : 'صيغة الفيديو غير مدعومة'}
                  </div>
                </div>
              ) : (
                <video className="w-full h-full rounded-lg bg-black" playsInline
                  src={assetUrl(activeVideo)}
                  controls autoPlay
                  onError={() => setVideoError(true)}
                />
              )}
            </motion.div>
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
