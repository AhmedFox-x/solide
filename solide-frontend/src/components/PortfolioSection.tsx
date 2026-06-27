import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "../lib/translations";
import { assetUrl } from "../lib/asset";
import type { Lang } from "../lib/translations";
import type { Project } from "../lib/api";

interface Props {
  lang: Lang;
  projects: Project[];
}

type Filter = "all" | "images" | "models3d";

function parseJSONList(v: string | null | undefined): string[] {
  if (!v) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export default function PortfolioSection({ lang, projects }: Props) {
  const t = translations.portfolio[lang];
  const [filter, setFilter] = useState<Filter>("all");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t.filterAll },
    { key: "images", label: t.filterImages },
    { key: "models3d", label: t.filterModels },
  ];

  const items = useMemo(() => {
    interface Item { type: "images" | "models3d"; url: string; projectTitle: string; project: Project }
    const result: Item[] = [];
    projects.forEach((p) => {
      const images = parseJSONList(p.images);
      const models = parseJSONList(p.models3d);
      if (filter === "all" || filter === "images") {
        if (images.length > 0) {
          images.forEach((url) => result.push({ type: "images", url, projectTitle: p.title, project: p }));
        } else if (filter === "all") {
          // no images, still show as placeholder
          result.push({ type: "images", url: "", projectTitle: p.title, project: p });
        }
      }
      if (filter === "all" || filter === "models3d") {
        if (models.length > 0) {
          models.forEach((url) => result.push({ type: "models3d", url, projectTitle: p.title, project: p }));
        } else if (filter === "all") {
          // no models, still show as placeholder (only if we didn't already add a placeholder above)
          if (images.length === 0) {
            result.push({ type: "models3d" as const, url: "", projectTitle: p.title, project: p });
          }
        }
      }
    });
    return result;
  }, [projects, filter]);

  return (
    <section id="portfolio" className="relative py-24 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-gold text-xs tracking-[0.25em] uppercase">
            {translations.navbar[lang][3]}
          </span>
          <h2 className="text-3xl md:text-5xl font-display mt-2 text-ivory">
            {t.heading}
          </h2>
          <div className="w-12 h-[1px] bg-gold/40 mx-auto mt-4" />
        </div>

        {/* filter tabs */}
        <div className="flex justify-center gap-1 mb-12">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
                filter === f.key
                  ? "bg-gold text-obsidian"
                  : "text-ivory/40 border border-ivory/10 hover:border-ivory/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
          >
            {items.map((item, i) => (
              <motion.div
                key={`${item.project.id}-${item.type}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="break-inside-avoid"
              >
                {item.url ? (
                  <Link to={`/project/${item.project.id}`} className="group relative w-full overflow-hidden block">
                    <img
                      src={assetUrl(item.url)}
                      alt={item.projectTitle}
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ minHeight: 200, maxHeight: 500 }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-xs text-ivory/70 tracking-[0.1em] uppercase">
                        {item.type === "models3d" ? "3D Model" : "Photo"} — {item.projectTitle}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="bg-gold text-obsidian text-[9px] tracking-wider uppercase px-2 py-1 font-semibold">
                        {lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="w-full bg-ivory/[0.02] border border-ivory/5 flex items-center justify-center py-16 px-4">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-ivory/10 flex items-center justify-center">
                        <span className="text-2xl text-ivory/20 font-display">{item.projectTitle.charAt(0).toUpperCase()}</span>
                      </div>
                      <p className="text-xs text-ivory/40 font-serif">{item.projectTitle}</p>
                      <p className="text-[10px] text-ivory/20 mt-1">{item.project.category}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {items.length === 0 && (
          <p className="text-center text-ivory/30 text-sm mt-12">
            {lang === "en" ? "No media yet." : "لا توجد وسائط بعد."}
          </p>
        )}
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-obsidian/90 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.img
              key={lightbox}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={assetUrl(lightbox)}
              alt=""
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
              className="absolute top-6 right-6 text-ivory/60 hover:text-ivory text-2xl"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
