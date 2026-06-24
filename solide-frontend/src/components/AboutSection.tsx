import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { translations } from "../lib/translations";
import type { Lang } from "../lib/translations";
import { TiltCard } from "./GeometricBg";

interface Props {
  lang: Lang;
}

export default function AboutSection({ lang }: Props) {
  const t = translations.about[lang];
  const te = translations.about[lang === "en" ? "ar" : "en"];
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reveal = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  const stagger = 0.1;

  return (
    <section id="about" ref={ref} className="relative py-28 md:py-36 px-4 overflow-hidden">
      {/* background accent */}
      <motion.div
        style={{ scale: useTransform(scrollYProgress, [0, 0.5], [0.8, 1.2]), opacity: useTransform(scrollYProgress, [0, 0.5], [0.3, 0.6]) }}
        className="absolute -top-40 -right-40 w-80 h-80 border border-gold/10 rounded-full"
      />

      <div className="max-w-6xl mx-auto relative">
        {/* heading — left aligned, bold */}
        <motion.div
          style={{ opacity: reveal, x: useTransform(reveal, [0, 1], [-30, 0]) }}
          className="mb-16"
        >
          <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">
            {translations.navbar[lang][1]}
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display text-ivory mt-2 leading-[0.9]">
            {lang === "en" ? "Wrought" : "فن"}
            <br />
            <span className="text-gold-gradient">{lang === "en" ? "Iron Art" : "الحديد الكريتال"}</span>
          </h2>
        </motion.div>

        {/* content — asymmetrical */}
        <div className="grid md:grid-cols-5 gap-8 md:gap-12 mb-20">
          {/* big stat */}
          <motion.div
            style={{ opacity: reveal, y: useTransform(reveal, [0, 1], [40, 0]) }}
            className="md:col-span-2"
          >
            <div className="text-7xl md:text-8xl lg:text-9xl font-display text-gold/20 leading-none">
              18
            </div>
            <div className="text-xs tracking-[0.2em] uppercase text-ivory/30 -mt-2">
              {lang === "en" ? "Years of Precision" : "سنوات من الدقة"}
            </div>
          </motion.div>

          {/* text pair */}
          <motion.div
            style={{ opacity: reveal, y: useTransform(reveal, [0, 1], [40, 0]) }}
            className="md:col-span-3 space-y-6"
          >
            <p className="text-ivory/70 text-lg leading-relaxed font-serif">
              {lang === "en" ? t.body : te.body}
            </p>
            <p className="text-ivory/60 text-base leading-relaxed" style={{ direction: "rtl" }}>
              {lang === "ar" ? t.body : te.body}
            </p>
          </motion.div>
        </div>

        {/* stats — glass cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {t.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * stagger }}
            >
              <TiltCard className="relative h-full overflow-hidden border border-ivory/5 bg-ivory/[0.015] px-4 py-8 md:py-10 text-center group hover:border-gold/15 transition-all duration-500">
                {/* bg hover glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative">
                  <div className="text-3xl md:text-4xl font-display text-gold mb-1.5">
                    {stat.value}
                  </div>
                  <div className="text-[10px] md:text-xs text-ivory/40 tracking-[0.2em] uppercase">
                    {stat.label}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
