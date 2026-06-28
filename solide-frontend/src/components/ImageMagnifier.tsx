import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  src: string;
  alt: string;
  zoom?: number;
  lensSize?: number;
  className?: string;
  lang?: "en" | "ar";
}

export default function ImageMagnifier({
  src, alt, zoom = 2.5, lensSize = 140, className = "", lang = "ar",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!locked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLocked(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLens({ x, y, show: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!locked) setLens((prev) => ({ ...prev, show: false }));
  }, [locked]);

  const handleClick = () => {
    setLocked((prev) => !prev);
  };

  const showLens = lens.show || locked;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative overflow-hidden transition-all duration-300 ${locked ? "cursor-none" : "cursor-none"} group ${className}`}
      style={{
        boxShadow: locked
          ? "inset 0 0 0 2px rgba(200,150,60,0.3), 0 0 40px rgba(200,150,60,0.08)"
          : "none",
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain select-none"
        draggable={false}
        style={{ maxHeight: 600 }}
      />

      {/* lens */}
      <AnimatePresence>
        {showLens && (
          <motion.div
            key="lens"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-20 rounded-full border-2 border-gold/40"
            style={{
              width: lensSize,
              height: lensSize,
              left: `calc(${lens.x}% - ${lensSize / 2}px)`,
              top: `calc(${lens.y}% - ${lensSize / 2}px)`,
              backgroundImage: `url(${src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
              backgroundPosition: `${lens.x}% ${lens.y}%`,
              boxShadow: locked
                ? "0 0 0 2px rgba(200,150,60,0.6), 0 0 30px rgba(200,150,60,0.25)"
                : "0 0 30px rgba(200,150,60,0.15)",
            }}
          />
        )}
      </AnimatePresence>

      {/* hints */}
      {!locked && !showLens && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
          <div className="bg-obsidian/80 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-wider text-gold/60 uppercase border border-gold/20 whitespace-nowrap">
            <span>{lang === "ar" ? "اضغط للتكبير الثابت" : "Click to lock zoom"}</span>
          </div>
        </div>
      )}

      {locked && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gold/80 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-wider text-obsidian font-semibold uppercase border border-gold whitespace-nowrap">
            <span>{lang === "ar" ? "اضغط للخروج" : "Click to exit"}</span>
          </div>
        </div>
      )}

      {showLens && (
        <div className="absolute top-4 right-4 z-10 bg-obsidian/70 backdrop-blur-sm px-2 py-1 text-[9px] text-gold/40 tracking-wider border border-gold/10 rounded">
          {zoom}x
        </div>
      )}

      {locked && (
        <div className="absolute top-4 left-4 z-10">
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        </div>
      )}
    </div>
  );
}
