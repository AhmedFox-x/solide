import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  src: string;
  alt: string;
  zoom?: number;
  className?: string;
  lang?: "en" | "ar";
}

export default function ImageMagnifier({
  src, alt, zoom = 2.5, className = "", lang = "ar",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [lens, setLens] = useState({ x: 50, y: 50, show: false });
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    if (zoomed) {
      setOrigin({ x: px, y: py });
    }
    setLens({ x: px, y: py, show: true });
  }, [zoomed]);

  const handleMouseLeave = useCallback(() => {
    if (!zoomed) setLens((prev) => ({ ...prev, show: false }));
  }, [zoomed]);

  const handleClick = () => {
    setZoomed((prev) => {
      if (!prev) setOrigin({ x: lens.x, y: lens.y });
      return !prev;
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative overflow-hidden cursor-none group select-none ${className}`}
    >
      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        className="w-full h-full object-contain select-none"
        style={{ maxHeight: 600, transformOrigin: `${origin.x}% ${origin.y}%` }}
        animate={{ scale: zoomed ? zoom : 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* zoomed indicator ring */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              boxShadow: "inset 0 0 0 2px rgba(200,150,60,0.3), 0 0 60px rgba(200,150,60,0.06)",
            }}
          />
        )}
      </AnimatePresence>

      {/* lens */}
      <AnimatePresence>
        {lens.show && !zoomed && (
          <motion.div
            key="lens"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-20 rounded-full border-2 border-gold/40"
            style={{
              width: 130,
              height: 130,
              left: `calc(${lens.x}% - 65px)`,
              top: `calc(${lens.y}% - 65px)`,
              backgroundImage: `url(${src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
              backgroundPosition: `${lens.x}% ${lens.y}%`,
              boxShadow: "0 0 30px rgba(200,150,60,0.15)",
            }}
          />
        )}
      </AnimatePresence>

      {/* hints */}
      {!zoomed && !lens.show && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
          <div className="bg-obsidian/80 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-wider text-gold/60 uppercase border border-gold/20 whitespace-nowrap">
            <span>{lang === "ar" ? "اضغط للتكبير" : "Click to zoom in"}</span>
          </div>
        </div>
      )}

      {zoomed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gold/80 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-wider text-obsidian font-semibold uppercase border border-gold whitespace-nowrap">
            <span>{lang === "ar" ? "اضغط أو Esc للخروج" : "Click or Esc to exit"}</span>
          </div>
        </div>
      )}

      {zoomed && (
        <div className="absolute top-4 right-4 z-10 bg-obsidian/70 backdrop-blur-sm px-2 py-1 text-[9px] text-gold/40 tracking-wider border border-gold/10 rounded">
          {zoom}x
        </div>
      )}

      {zoomed && (
        <div className="absolute top-4 left-4 z-10">
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        </div>
      )}
    </div>
  );
}
