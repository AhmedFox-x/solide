import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { translations } from '../lib/translations'
import type { Lang } from '../lib/translations'
import logo from '../assets/logo-bg.png'

interface Props {
  lang: Lang
  setLang: (l: Lang) => void
}

// home page has sections, portfolio/videos are separate page routes
const NAV_ITEMS = [
  { path: '/', labelIdx: 0 },
  { path: '/portfolio', labelIdx: 3 },
  { path: '/videos', labelIdx: 4 },
]

export default function AppNavbar({ lang, setLang }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const nav = translations.navbar[lang]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <motion.nav
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-obsidian/90 backdrop-blur-md border-b border-ivory/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={logo}
                alt="Solide"
                className="w-9 h-9 md:w-11 md:h-11 object-contain transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gold/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-lg md:text-xl tracking-[0.25em] text-ivory hidden sm:inline">
              SOLIDE
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((ni) => (
              <Link
                key={ni.path}
                to={ni.path}
                className={`relative px-3 lg:px-4 py-2 text-xs lg:text-sm transition-colors tracking-[0.15em] uppercase ${
                  isActive(ni.path)
                    ? 'text-gold'
                    : 'text-ivory/40 hover:text-gold'
                }`}
              >
                {nav[ni.labelIdx]}
                {isActive(ni.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gold/60" />
                )}
              </Link>
            ))}
            <div className="mr-3 pr-3 border-r border-ivory/10">
              <button
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="text-xs tracking-[0.15em] uppercase text-gold hover:text-gold/80 transition-colors"
              >
                {lang === 'ar' ? 'EN' : 'عربي'}
              </button>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-ivory/60 hover:text-gold transition-colors"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-obsidian/98 backdrop-blur-xl flex flex-col items-center justify-center gap-6 md:hidden"
          >
            {NAV_ITEMS.map((ni) => (
              <Link
                key={ni.path}
                to={ni.path}
                onClick={() => setMenuOpen(false)}
                className={`text-2xl font-display transition-colors ${
                  isActive(ni.path) ? 'text-gold' : 'text-ivory/70 hover:text-gold'
                }`}
              >
                {nav[ni.labelIdx]}
              </Link>
            ))}
            <button
              onClick={() => { setLang(lang === 'en' ? 'ar' : 'en'); setMenuOpen(false) }}
              className="text-sm tracking-[0.15em] uppercase text-gold border border-gold/30 px-5 py-2 mt-4"
            >
              {lang === 'ar' ? 'English' : 'عربي'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
