import { useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { translations } from "../lib/translations";
import type { Lang } from "../lib/translations";
import logo from "../assets/logo-bg.png";

const videoSrc = `${import.meta.env.BASE_URL}video/hero-bg.mp4`;

interface Props {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export default function HeroSection({ lang, setLang }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = translations.hero;
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.92]);
  const y = useTransform(scrollY, [0, 500], [0, -120]);

  const otherLang = lang === "en" ? "ar" : "en";

  const handleVideoEnded = useCallback(() => {
    setTimeout(() => {
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    }, 2500);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* video background */}
      <style>{`@media (prefers-reduced-motion: reduce) { .hero-video { display: none; } }`}</style>
      <div className="absolute inset-0 overflow-hidden hero-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ height: "80vh", top: "50%", transform: "translateY(-50%)" }}
          onEnded={handleVideoEnded}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        {/* dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/60 to-obsidian/90" />
      </div>

      {/* large watermark logo */}
      <motion.div
        style={{ opacity: useTransform(scrollY, [0, 300], [0.1, 0.02]) }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <img
          src={logo}
          alt=""
          className="w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] object-contain opacity-20"
          style={{
            filter: "blur(3px) saturate(0.3)",
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-gold/5 blur-[150px] pointer-events-none" />

      {/* scan line */}
      <div
        className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent z-[2] pointer-events-none"
        style={{ animation: "scanV 6s ease-in-out infinite" }}
      />

      {/* decorative corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-gold/10 pointer-events-none" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-gold/10 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-gold/10 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-gold/10 pointer-events-none" />

      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 text-center px-4 max-w-5xl mx-auto"
      >
        {/* lang toggle */}
        <button
          onClick={() => setLang(otherLang)}
          className="absolute -top-20 right-0 text-xs tracking-[0.2em] uppercase text-ivory/30 hover:text-gold transition-colors"
        >
          {otherLang === "ar" ? "عربي" : "English"}
        </button>

        {/* premium badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-gold/15 text-gold/50 text-[10px] tracking-[0.3em] uppercase font-sans">
            <span className="w-4 h-[1px] bg-gold/30" />
            {lang === "en" ? "Premium Metal Craftsmanship" : "الصناعة المعدنية الفاخرة"}
            <span className="w-4 h-[1px] bg-gold/30" />
          </span>
        </motion.div>

        {/* subtitle EN */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-6"
        >
          <span className="inline-block px-5 py-2 border border-gold/20 text-gold text-xs tracking-[0.25em] uppercase">
            {t.en.subtitle}
          </span>
        </motion.div>

        {/* main heading */}
        <motion.h1
          key={`heading-${lang}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-6xl sm:text-8xl md:text-9xl lg:text-[140px] font-display leading-[0.82] mb-8"
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
          className="text-ivory/50 text-xl md:text-3xl font-sans mb-14 leading-relaxed"
          style={{ direction: "rtl" }}
        >
          {t.ar.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-wrap justify-center gap-5"
        >
          <Link
            to="/portfolio"
            className="group relative px-10 py-4 overflow-hidden border border-gold text-gold hover:text-obsidian transition-all duration-500 text-sm tracking-[0.15em] uppercase"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              {lang === "en" ? "View Our Work" : "شاهد أعمالنا"}
            </span>
            <span className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </Link>
          <a
            href="#contact"
            className="group relative px-10 py-4 overflow-hidden bg-gold text-obsidian text-sm tracking-[0.15em] uppercase font-semibold"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
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
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/15">
          {lang === "en" ? "Scroll" : "اسفل"}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-4 h-7 border border-ivory/10 rounded-full flex items-start justify-center pt-1.5"
        >
          <div className="w-[2px] h-2 bg-gold/30 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
