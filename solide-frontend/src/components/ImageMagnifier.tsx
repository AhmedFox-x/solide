import { useRef, useState, useCallback } from "react";
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
  const [lens, setLens] = useState({ x: 50, y: 50, show: false });
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const getPos = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e.clientX, e.clientY);
    if (!pos) return;
    if (zoomed) setOrigin(pos);
    setLens({ ...pos, show: true });
  }, [zoomed, getPos]);

  const handleMouseLeave = useCallback(() => {
    if (!zoomed) setLens((prev) => ({ ...prev, show: false }));
  }, [zoomed]);

  const doToggle = useCallback((clientX: number, clientY: number) => {
    const pos = getPos(clientX, clientY);
    setZoomed((prev) => {
      if (!prev && pos) setOrigin(pos);
      return !prev;
    });
  }, [getPos]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    doToggle(e.clientX, e.clientY);
  }, [doToggle]);

  const touchRef = useRef<number | null>(null);
  const touchMoved = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    touchMoved.current = false;
    if (e.touches.length === 1) {
      touchRef.current = e.touches[0].identifier;
      const t = e.touches[0];
      const pos = getPos(t.clientX, t.clientY);
      if (!zoomed && pos) {
        setOrigin(pos);
        setLens({ ...pos, show: false });
      }
    }
  }, [zoomed, getPos]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    touchMoved.current = true;
    if (zoomed && e.touches.length === 1) {
      const pos = getPos(e.touches[0].clientX, e.touches[0].clientY);
      if (pos) setOrigin(pos);
    }
  }, [zoomed, getPos]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchMoved.current) {
      const t = e.changedTouches[0];
      doToggle(t.clientX, t.clientY);
    }
    touchRef.current = null;
  }, [doToggle]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative overflow-hidden cursor-none group select-none ${className}`}
      style={{
        WebkitTouchCallout: "none" as any,
        WebkitUserSelect: "none",
        userSelect: "none",
        touchAction: zoomed ? "none" : ("pan-y" as any),
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        draggable={false}
        className="w-full h-full object-contain pointer-events-none"
        style={{
          maxHeight: 600,
          transformOrigin: `${origin.x}% ${origin.y}%`,
        }}
        animate={{ scale: zoomed ? zoom : 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      />

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
            <span>{lang === "ar" ? "اضغط للتصغير" : "Click to zoom out"}</span>
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
