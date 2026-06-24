import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "../lib/translations";
import type { Lang } from "../lib/translations";
import type { Project } from "../lib/api";

interface Props {
  lang: Lang;
  projects: Project[];
}

function parseJSONList(v: string | null | undefined): string[] {
  if (!v) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function videoId(url: string): string | null {
  const match =
    url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    ) ||
    url.match(/vimeo\.com\/(\d+)/) ||
    url.match(/\.(mp4|webm|mov)(?:\?.*)?$/i);
  return match ? match[1] : null;
}

function embedUrl(url: string): string | null {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  if (url.match(/\.(mp4|webm)(?:\?.*)?$/i)) return url;
  return null;
}

export default function VideoSection({ lang, projects }: Props) {
  const t = translations.videos[lang];
  const [active, setActive] = useState<string | null>(null);

  const videos = useMemo(() => {
    const result: { url: string; projectTitle: string; projectId: string }[] = [];
    projects.forEach((p) => {
      const vids = parseJSONList(p.videos);
      if (vids.length > 0) {
        vids.forEach((url) => result.push({ url, projectTitle: p.title, projectId: p.id }));
      } else {
        // show placeholder project card
        result.push({ url: '', projectTitle: p.title, projectId: p.id });
      }
    });
    return result;
  }, [projects]);

  return (
    <section id="videos" className="relative py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-gold text-xs tracking-[0.25em] uppercase">
            {translations.navbar[lang][4]}
          </span>
          <h2 className="text-3xl md:text-5xl font-display mt-2 text-ivory">
            {t.heading}
          </h2>
          <p className="text-ivory/40 text-sm mt-3 max-w-md mx-auto">{t.subtitle}</p>
          <div className="w-12 h-[1px] bg-gold/40 mx-auto mt-4" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((v, i) => (
            v.url ? (
              <motion.button
                key={`${v.url}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                onClick={() => setActive(v.url)}
                className="group relative aspect-video bg-ivory/5 overflow-hidden border border-ivory/5 hover:border-gold/20 transition-colors"
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId(v.url)}/hqdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 border-2 border-gold/60 rounded-full flex items-center justify-center group-hover:bg-gold/20 transition-all duration-300">
                    <svg className="w-5 h-5 text-gold ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-obsidian/80 to-transparent">
                  <p className="text-xs text-ivory/60 truncate">{v.projectTitle}</p>
                </div>
              </motion.button>
            ) : (
              <motion.div
                key={`placeholder-${v.projectId}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="aspect-video bg-ivory/[0.02] border border-ivory/5 flex items-center justify-center"
              >
                <div className="text-center">
                  <svg className="w-8 h-8 text-ivory/10 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 10l4 2-4 2z" />
                  </svg>
                  <p className="text-xs text-ivory/30 font-serif">{v.projectTitle}</p>
                  <p className="text-[10px] text-ivory/20 mt-0.5">{lang === 'en' ? 'No video' : 'لا يوجد فيديو'}</p>
                </div>
              </motion.div>
            )
          ))}
        </div>
      </div>

      {/* video modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-video"
            >
              <iframe
                src={embedUrl(active) || ""}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Video player"
              />
              <button
                onClick={() => setActive(null)}
                className="absolute -top-10 right-0 text-ivory/40 hover:text-ivory text-sm"
              >
                {lang === "en" ? "Close" : "إغلاق"} ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
