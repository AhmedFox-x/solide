import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "../lib/translations";
import type { Lang } from "../lib/translations";
import type { Testimonial } from "../lib/api";

interface Props {
  lang: Lang;
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ lang, testimonials }: Props) {
  const t = translations.testimonials[lang];
  const [idx, setIdx] = useState(0);

  if (testimonials.length === 0) return null;

  const current = testimonials[idx];

  const next = () => setIdx((i) => (i + 1) % testimonials.length);
  const prev = () => setIdx((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="relative py-24 md:py-32 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-gold text-xs tracking-[0.25em] uppercase">
          {translations.navbar[lang][5]}
        </span>
        <h2 className="text-3xl md:text-5xl font-display mt-2 text-ivory mb-12">
          {t.heading}
        </h2>

        <div className="relative min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="px-4"
            >
              <svg className="w-8 h-8 text-gold/30 mx-auto mb-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
              </svg>
              <p className="text-ivory/70 text-lg md:text-xl leading-relaxed mb-6 italic font-serif">
                &ldquo;{current.content}&rdquo;
              </p>
              <p className="text-gold text-sm tracking-[0.15em] uppercase">
                {current.name}
              </p>
              {current.company && (
                <p className="text-ivory/30 text-xs mt-1">{current.company}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* nav */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="text-ivory/30 hover:text-gold transition-colors text-sm tracking-[0.15em] uppercase"
            >
              ← {lang === "en" ? "Prev" : "السابق"}
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === idx ? "bg-gold w-6" : "bg-ivory/20"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="text-ivory/30 hover:text-gold transition-colors text-sm tracking-[0.15em] uppercase"
            >
              {lang === "en" ? "Next" : "التالي"} →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
