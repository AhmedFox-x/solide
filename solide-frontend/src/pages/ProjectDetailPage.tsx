import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Lang } from '../lib/translations'
import { assetUrl } from '../lib/asset'
import { projectsApi } from '../lib/api'
import type { Project } from '../lib/api'
import GeometricBg from '../components/GeometricBg'
import AppNavbar from '../components/AppNavbar'
import ImageMagnifier from '../components/ImageMagnifier'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react'
import logo from '../assets/logo-bg.png'

function parseList(v: string | null | undefined): string[] {
  if (!v) return []
  try { const p = JSON.parse(v); return Array.isArray(p) ? p.filter(Boolean) : [] }
  catch { return [] }
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lang, setLang] = useState<Lang>('ar')
  const [project, setProject] = useState<Project | null>(null)
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState(0)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      projectsApi.byId(id),
      projectsApi.list(),
    ]).then(([projRes, listRes]) => {
      setProject(projRes.project)
      setAllProjects(listRes.projects)
    }).catch(() => navigate('/portfolio'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const allImages = useMemo(() => {
    if (!project) return []
    const result: string[] = []
    if (project.beforeImage) result.push(project.beforeImage)
    if (project.afterImage) result.push(project.afterImage)
    parseList(project.images).forEach(u => { if (!result.includes(u)) result.push(u) })
    return result
  }, [project])

  const currentIdx = useMemo(() => {
    return allProjects.findIndex(p => p.id === project?.id)
  }, [allProjects, project?.id])

  const goNext = useCallback(() => {
    if (currentIdx < allProjects.length - 1) {
      navigate(`/project/${allProjects[currentIdx + 1].id}`)
    }
  }, [currentIdx, allProjects, navigate])

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      navigate(`/project/${allProjects[currentIdx - 1].id}`)
    }
  }, [currentIdx, allProjects, navigate])

  if (loading) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-obsidian text-ivory min-h-screen" lang={lang}>
        <GeometricBg count={15} />
        <AppNavbar lang={lang} setLang={setLang} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-obsidian text-ivory min-h-screen" lang={lang}>
      <GeometricBg count={12} />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: '250px', backgroundRepeat: 'repeat' }}
      />
      <AppNavbar lang={lang} setLang={setLang} />

      <main className="pt-24 md:pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* back + navigation */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate('/portfolio')}
              className="group inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold/60 hover:text-gold transition-colors"
            >
              {lang === 'ar' ? (
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              ) : (
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              )}
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'رجوع للمعرض' : 'Back to gallery'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button onClick={goPrev} disabled={currentIdx <= 0}
                className="p-2 border border-ivory/10 text-ivory/40 hover:text-ivory hover:border-ivory/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-ivory/30 tracking-wider">
                {currentIdx + 1} / {allProjects.length}
              </span>
              <button onClick={goNext} disabled={currentIdx >= allProjects.length - 1}
                className="p-2 border border-ivory/10 text-ivory/40 hover:text-ivory hover:border-ivory/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* gallery */}
          <div className="grid lg:grid-cols-5 gap-6 mb-16">
            {/* main image */}
            <motion.div
              key={selectedIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-3 relative overflow-hidden border border-ivory/5 group"
              style={{ minHeight: 400, maxHeight: 600 }}
            >
              {allImages[selectedIdx] ? (
                <ImageMagnifier
                  src={assetUrl(allImages[selectedIdx])}
                  alt={project.title}
                  className="w-full h-full bg-ivory/[0.02]"
                  lang={lang}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-ivory/[0.02]" style={{ minHeight: 400 }}>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-ivory/10 flex items-center justify-center text-ivory/20 text-2xl font-display">
                      {project.title.charAt(0)}
                    </div>
                    <p className="text-xs text-ivory/20">{lang === 'ar' ? 'لا توجد صور' : 'No images'}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* thumbnails + info */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* project info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="border border-ivory/5 bg-ivory/[0.015] p-5"
              >
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] px-2 py-0.5 bg-gold/10 text-gold/70 tracking-wider">{project.type}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-ivory/5 text-ivory/40">{project.category}</span>
                </div>
                <h1 className="text-2xl font-display text-ivory mb-3">{project.title}</h1>
                {project.description && (
                  <p className="text-sm text-ivory/50 leading-relaxed">{project.description}</p>
                )}
              </motion.div>

              {/* thumbnails */}
              {allImages.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="border border-ivory/5 bg-ivory/[0.015] p-4"
                >
                  <p className="text-[10px] tracking-[0.2em] uppercase text-ivory/30 mb-3">
                    {lang === 'ar' ? 'معرض الصور' : 'Gallery'} ({allImages.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {allImages.map((url, i) => (
                      <button key={i} onClick={() => setSelectedIdx(i)}
                        className={`relative overflow-hidden border transition-all duration-300 ${
                          i === selectedIdx
                            ? 'border-gold/60 ring-1 ring-gold/30'
                            : 'border-ivory/5 hover:border-ivory/30 opacity-60 hover:opacity-100'
                        }`}
                        style={{ aspectRatio: '1' }}
                      >
                        <img src={assetUrl(url)} alt={`${project.title} ${i + 1}`}
                          className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-auto"
              >
                <button onClick={() => navigate('/', { state: { orderProject: { id: project.id, title: project.title, images: allImages } } })}
                  className="w-full group inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-br from-gold/80 to-gold text-obsidian font-sans text-sm tracking-[0.25em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(200,150,60,0.28)]"
                  style={{ clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)" }}
                >
                  {lang === 'ar' ? 'اطلب هذا التصميم' : 'Order this design'}
                  {lang === 'ar' ? (
                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  )}
                </button>
              </motion.div>
            </div>
          </div>

          {/* divider */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/10 to-transparent mb-16" />

          {/* related / all projects strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-xs tracking-[0.3em] uppercase text-gold/40 mb-6 font-sans">
              {lang === 'ar' ? 'مشاريع أخرى' : 'More Projects'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {allProjects.filter(p => p.id !== project.id).slice(0, 6).map(p => {
                const cover = p.beforeImage || parseList(p.images)[0] || null
                return (
                  <button key={p.id} onClick={() => navigate(`/project/${p.id}`)}
                    className="group relative overflow-hidden border border-ivory/5 hover:border-gold/15 transition-all bg-ivory/[0.015]"
                  >
                    <div style={{ aspectRatio: '4/3' }} className="overflow-hidden">
                      {cover ? (
                        <img src={assetUrl(cover)} alt={p.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-ivory/[0.02]">
                          <span className="text-ivory/10 text-lg font-display">{p.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-xs text-ivory/90 font-serif truncate">{p.title}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </main>

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
