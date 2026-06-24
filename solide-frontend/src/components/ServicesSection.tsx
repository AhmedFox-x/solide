import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { translations } from "../lib/translations";
import type { Lang } from "../lib/translations";
import { TiltCard } from "./GeometricBg";

interface Props {
  lang: Lang;
}

const ICONS = [
  "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  "M14 3v4a1 1 0 001 1h4M5 12h14M7 16h10M7 20h6",
  "M12 21a9 9 0 100-18 9 9 0 000 18zM8 14s1.5 2 4 2 4-2 4-2",
  "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z",
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  "M2 20L12 2 22 20H2z",
];

export default function ServicesSection({ lang }: Props) {
  const t = translations.services[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const lineGrow = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section id="services" ref={sectionRef} className="relative py-28 md:py-36 px-4 overflow-hidden">
      {/* accent lines */}
      <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gold/[0.03] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gold/[0.03] to-transparent" />

      <motion.div
        style={{ scaleY: lineGrow }}
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[1px] bg-gold/20 origin-top"
      />

      <div className="max-w-6xl mx-auto relative">
        {/* heading */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">
            {translations.navbar[lang][2]}
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display text-ivory mt-2 leading-[0.95]">
            {t.heading}
          </h2>
        </motion.div>

        {/* cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {t.items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <TiltCard className="group relative h-full border border-ivory/5 bg-ivory/[0.015] p-6 md:p-8 hover:border-gold/15 transition-all duration-500 overflow-hidden">
                {/* corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* icon */}
                <div className="w-10 h-10 mb-5 text-gold/60 group-hover:text-gold transition-colors duration-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS[i % ICONS.length]} />
                  </svg>
                </div>

                <h3 className="text-lg font-serif text-ivory mb-2">{item.title}</h3>
                <p className="text-sm text-ivory/40 leading-relaxed group-hover:text-ivory/60 transition-colors duration-500">{item.desc}</p>

                {/* bottom line */}
                <div className="mt-6 h-[1px] w-0 bg-gradient-to-r from-gold/40 to-transparent group-hover:w-full transition-all duration-700" />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
