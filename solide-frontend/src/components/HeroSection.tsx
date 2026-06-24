import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { translations } from "../lib/translations";
import type { Lang } from "../lib/translations";
import logo from "../assets/logo-bg.png";

interface Props {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export default function HeroSection({ lang, setLang }: Props) {
  const t = translations.hero;
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.9]);
  const y = useTransform(scrollY, [0, 400], [0, -80]);

  const otherLang = lang === "en" ? "ar" : "en";

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* large watermark logo */}
      <motion.div
        style={{ opacity: useTransform(scrollY, [0, 300], [0.08, 0.02]) }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <img
          src={logo}
          alt=""
          className="w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] object-contain opacity-30"
          style={{
            filter: "blur(2px) saturate(0.5)",
            mixBlendMode: "screen",
          }}
        />
      </motion.div>

      {/* grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#C8963C 1px, transparent 1px), linear-gradient(90deg, #C8963C 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      {/* scan line */}
      <div
        className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent z-[2] pointer-events-none"
        style={{ animation: "scanV 6s ease-in-out infinite" }}
      />

      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        {/* lang toggle */}
        <button
          onClick={() => setLang(otherLang)}
          className="absolute -top-20 right-0 text-xs tracking-[0.2em] uppercase text-ivory/30 hover:text-gold transition-colors"
        >
          {otherLang === "ar" ? "عربي" : "English"}
        </button>

        {/* subtitle EN */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 border border-gold/20 text-gold text-xs tracking-[0.25em] uppercase">
            {t.en.subtitle}
          </span>
        </motion.div>

        {/* main heading */}
        <motion.h1
          key={`heading-${lang}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display leading-[0.85] mb-6"
        >
          <span className="text-gold-gradient">
            {lang === "en" ? "Solide" : "سوليد"}
          </span>
        </motion.h1>

        {/* tagline AR */}
        <motion.p
          key={`ar-tag-${lang}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-ivory/60 text-lg md:text-2xl font-sans mb-12 leading-relaxed"
          style={{ direction: "rtl" }}
        >
          {t.ar.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/portfolio"
            className="group relative px-8 py-3.5 overflow-hidden border border-gold text-gold hover:text-obsidian transition-all duration-500 text-sm tracking-[0.15em] uppercase"
          >
            <span className="relative z-10">
              {lang === "en" ? "View Our Work" : "شاهد أعمالنا"}
            </span>
            <span className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </Link>
          <a
            href="#contact"
            className="group relative px-8 py-3.5 overflow-hidden bg-gold text-obsidian text-sm tracking-[0.15em] uppercase font-semibold"
          >
            <span className="relative z-10">
              {lang === "en" ? "Start a Project" : "ابدأ مشروعاً"}
            </span>
            <span className="absolute inset-0 bg-ivory/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </a>
        </motion.div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/20">
          {lang === "en" ? "Scroll" : "اسفل"}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-4 h-7 border border-ivory/15 rounded-full flex items-start justify-center pt-1.5"
        >
          <div className="w-[2px] h-2 bg-gold/40 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
