import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { translations } from '../lib/translations'
import { assetUrl } from '../lib/asset'
import { projectsApi } from '../lib/api'
import type { Project } from '../lib/api'
import GeometricBg from '../components/GeometricBg'
import AppNavbar from '../components/AppNavbar'
import { useLang } from '../lib/useLang'
import LazyImage from '../components/LazyImage'
import { X, Maximize2, Cuboid } from 'lucide-react'
import logo from '../assets/logo-bg.png'

const STATIC_3D_MODELS: { file: string; title: string; desc: string }[] = [
  { file: 'main-villa-gate.glb', title: 'بوابة فيلا رئيسية', desc: 'بوابة مزدوجة ضخمة بزخارف كريتال كلاسيكية مع شعار S مركزي وتفاصيل ذهبية.' },
  { file: 'entrance-gate.glb', title: 'بوابة فيلا خارجية', desc: 'تصميم حديث بخطوط نظيفة وشرائح أفقية مع لمسات ذهبية.' },
  { file: 'stair-railing-internal.glb', title: 'درابزين سلم داخلي', desc: 'درابزين حديد بمقبض خشبي وتفاصيل S-Scroll ذهبية.' },
  { file: 'balcony-railing.glb', title: 'درابزين بلكونة', desc: 'نقشات حلزونية وزخارف نباتية متكررة بإطار ذهبي.' },
  { file: 'external-staircase.glb', title: 'سلم خارجي', desc: 'سلم حديد بدرجات صلب وحواف ذهبية ودرابزين جانبي.' },
  { file: 'roof-stairs.glb', title: 'سلم بدروم / روف', desc: 'تصميم صناعي بسيط بدرابزين أنبوبي مزدوج.' },
  { file: 'window-grill.glb', title: 'شباك حماية', desc: 'شبكة كريتال مربعات مع تفصيلة ماسة ذهبية مركزية.' },
  { file: 'fence-section.glb', title: 'سور خارجي', desc: 'سور بأعمدة حديد وأطراف رمحية ذهبية بين دعامتين.' },
  { file: 'iron-door.glb', title: 'باب حديد خارجي', desc: 'باب ثقيل بشرائح حديد متقاطعة ومقبض حلقي ذهبي.' },
  { file: 'custom-art-piece.glb', title: 'تصميم حر — تحفة فنية', desc: 'منحوتة حائط بحرف S الذهبي المستوحى من شعار Solide.' },
]

function parseList(v: string | null | undefined): string[] {
  if (!v) return []
  try { const p = JSON.parse(v); return Array.isArray(p) ? p.filter(Boolean) : [] }
  catch { return [] }
}

function isEmbedUrl(url: string): string | null {
  const sketchfab = url.match(/sketchfab\.com\/3d-models\/([a-zA-Z0-9-]+)/)
  if (sketchfab) return `https://sketchfab.com/models/${sketchfab[1]}/embed`
  return null
}

function isGlb(url: string): boolean {
  return /\b\.glb\b/i.test(url) || url.endsWith('.glb')
}

export default function PortfolioPage() {
  const [lang, setLang] = useLang()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const t = translations.portfolio[lang]
  const [filter, setFilter] = useState<'projects' | 'individual' | 'models3d'>('projects')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [modelViewer, setModelViewer] = useState<{ url: string; title: string } | null>(null)
  const [modelInteracted, setModelInteracted] = useState(false)
  const projectTypes = translations.projectTypes[lang]
  const typeScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    projectsApi.list().then(r => setProjects(r.projects)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filters = [
    { key: 'projects' as const, label: t.filterProjects },
    { key: 'individual' as const, label: t.filterIndividual },
    { key: 'models3d' as const, label: t.filterModels },
  ]

  const cards = useMemo(() => {
    return projects.filter(p => typeFilter === 'all' || p.type === typeFilter)
      .filter(p => parseList(p.images).length > 0 || parseList(p.models3d).length > 0 || !!p.beforeImage)
      .map(p => ({
        id: p.id, title: p.title, category: p.category, type: p.type,
        description: p.description,
        coverImage: p.beforeImage || (parseList(p.images)[0] || null),
        imageCount: parseList(p.images).length + (p.beforeImage ? 1 : 0) + (p.afterImage ? 1 : 0),
      }))
  }, [projects, typeFilter])

  const individualItems = useMemo(() => {
    const result: { key: string; url: string; projectTitle: string; projectId: string }[] = []
    projects.forEach(p => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return
      parseList(p.images).forEach(u => result.push({ key: `${p.id}-img-${u}`, url: u, projectTitle: p.title, projectId: p.id }))
    })
    return result
  }, [projects, typeFilter])

  const modelItems = useMemo(() => {
    const result: { key: string; url: string; title: string; desc?: string; projectId?: string }[] = []
    projects.forEach(p => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return
      parseList(p.models3d).forEach(u => result.push({ key: `${p.id}-mdl-${u}`, url: u, title: p.title, projectId: p.id }))
    })
    return result
  }, [projects, typeFilter])

  const staticModels = useMemo(() => {
    return STATIC_3D_MODELS.map((m, i) => ({
      key: `static-${i}`, url: `/models/glb/${m.file}`, title: m.title, desc: m.desc,
    }))
  }, [])

  const closeModelViewer = useCallback(() => {
    setModelViewer(null)
    setModelInteracted(false)
  }, [])

  const handleModelClick = useCallback((url: string, title: string) => {
    setModelViewer({ url, title })
    setModelInteracted(false)
  }, [])

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

          {/* type filters — horizontal scroll on mobile */}
          <div ref={typeScrollRef}
            className="overflow-x-auto scrollbar-none mb-10 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-2 w-max">
              <button onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 text-[11px] tracking-wider transition-all whitespace-nowrap ${
                  typeFilter === 'all' ? 'bg-ivory/10 text-ivory' : 'text-ivory/30 border border-ivory/10 hover:border-ivory/30'
                }`}
              >{t.filterTypeAll}</button>
              {projectTypes.map(ty => (
                <button key={ty} onClick={() => setTypeFilter(ty)}
                  className={`px-3 py-1 text-[11px] tracking-wider transition-all whitespace-nowrap ${
                    typeFilter === ty ? 'bg-ivory/10 text-ivory' : 'text-ivory/30 border border-ivory/10 hover:border-ivory/30'
                  }`}
                >{ty}</button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filter === 'projects' ? (
              <motion.div key="projects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
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
                            <LazyImage src={assetUrl(item.coverImage)}
                              alt={item.title} className="w-full h-full transition-transform duration-700 group-hover:scale-[1.06]" />
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
            ) : filter === 'individual' ? (
              <motion.div key="individual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
              >
                {individualItems.map((item) => (
                  <motion.div key={item.key} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }} className="break-inside-avoid"
                  >
                    <div className="group relative overflow-hidden border border-ivory/5 hover:border-gold/15 transition-all bg-ivory/[0.015]">
                      <button onClick={() => setLightbox(item.url)} className="block w-full">
                        <LazyImage src={assetUrl(item.url)} alt={item.projectTitle}
                          className="w-full transition-transform duration-700 group-hover:scale-[1.02]"
                          minHeight={200} maxHeight={450} />
                      </button>
                      <div className="p-4">
                        <Link to={`/project/${item.projectId}`}
                          className="text-sm font-serif text-ivory/70 hover:text-gold transition-colors"
                        >{item.projectTitle}</Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="models" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {[...staticModels, ...modelItems].map((item) => (
                  <motion.div key={item.key} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="group relative overflow-hidden border border-ivory/5 hover:border-gold/15 transition-all bg-ivory/[0.015] h-full flex flex-col">
                      <button onClick={() => handleModelClick(item.url, item.title)}
                        className="w-full flex-1 cursor-pointer">
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-ivory/[0.01] to-ivory/[0.03] py-20">
                          <div className="text-center px-6">
                            <Cuboid className="w-10 h-10 mx-auto mb-4 text-ivory/20 group-hover:text-gold/50 transition-all duration-300" />
                            <p className="text-sm font-serif text-ivory/60 group-hover:text-gold transition-colors duration-300">{item.title}</p>
                            {'desc' in item && (
                              <p className="text-xs text-ivory/30 mt-2 leading-relaxed">{item.desc}</p>
                            )}
                            <p className="text-[10px] text-ivory/20 mt-4 tracking-wider group-hover:text-gold/40 transition-colors">
                              {lang === 'ar' ? '👆 اضغط للعرض ثلاثي الأبعاد' : '👆 Click to view 3D Model'}
                            </p>
                          </div>
                        </div>
                      </button>
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
          ) : filter === 'projects' && cards.length === 0 || filter === 'individual' && individualItems.length === 0 || filter === 'models3d' && modelItems.length === 0 && staticModels.length === 0 ? (
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

      {/* 3D Model viewer with gesture isolation */}
      <AnimatePresence>
        {modelViewer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4"
          >
            {/* close */}
            <button onClick={closeModelViewer}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-ivory/60 hover:text-ivory transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div key={modelViewer.url} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl h-[80vh] bg-black/50 rounded overflow-hidden"
            >
              {isGlb(modelViewer.url) ? (
                <>
                  {/* @ts-expect-error model-viewer is a custom element loaded from CDN */}
                  <model-viewer src={assetUrl(modelViewer.url)}
                    alt={modelViewer.title}
                    className="w-full h-full"
                    camera-controls
                    auto-rotate
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    style={{ pointerEvents: modelInteracted ? 'auto' : 'none', width: '100%', height: '100%' }}
                  />
                  {!modelInteracted && (
                    <div onClick={() => setModelInteracted(true)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 transition-opacity hover:bg-black/20"
                    >
                      <div className="text-center">
                        <Maximize2 className="w-8 h-8 mx-auto mb-3 text-gold/60" />
                        <p className="text-sm tracking-[0.2em] uppercase text-ivory/60">
                          {lang === 'ar' ? 'اضغط للتفاعل مع النموذج' : 'Tap to interact with model'}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : isEmbedUrl(modelViewer.url) ? (
                <>
                  <iframe src={isEmbedUrl(modelViewer.url)!}
                    title={modelViewer.title}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    allowFullScreen
                    style={{ pointerEvents: modelInteracted ? 'auto' : 'none' }}
                  />
                  {!modelInteracted && (
                    <div onClick={() => setModelInteracted(true)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 transition-opacity hover:bg-black/20"
                    >
                      <div className="text-center">
                        <Maximize2 className="w-8 h-8 mx-auto mb-3 text-gold/60" />
                        <p className="text-sm tracking-[0.2em] uppercase text-ivory/60">
                          {lang === 'ar' ? 'اضغط للتفاعل مع النموذج' : 'Tap to interact with model'}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-ivory/60 mb-4">{modelViewer.title}</p>
                    <a href={modelViewer.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-gold/30 text-gold text-xs tracking-[0.2em] uppercase hover:bg-gold/10 transition-all"
                    >
                      <Maximize2 className="w-4 h-4" />
                      {lang === 'ar' ? 'فتح النموذج' : 'Open Model'}
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-10 px-4 border-t border-ivory/5">
        <div className="max-w-6xl mx-auto text-center">
          <span className="font-display text-xs text-ivory/10 tracking-widest block mb-2">SOLIDE</span>
          <p className="text-ivory/20 text-[10px]">
            © {new Date().getFullYear()} Solide. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
