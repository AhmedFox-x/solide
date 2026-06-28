import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  src: string;
  alt: string;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  lang?: "en" | "ar";
}

export default function ImageMagnifier({
  src, alt, minZoom = 1, maxZoom = 6, className = "", lang = "ar",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2.5);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const getPos = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  /* mouse */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!zoomed) return;
    const pos = getPos(e.clientX, e.clientY);
    if (pos) setOrigin(pos);
  }, [zoomed, getPos]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setZoomed((prev) => {
      if (!prev) {
        const pos = getPos(e.clientX, e.clientY);
        if (pos) setOrigin(pos);
        setZoomLevel(2.5);
      }
      return !prev;
    });
  }, [getPos]);

  /* touch */
  const touchMoved = useRef(false);
  const lastPinchDist = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    touchMoved.current = false;
    if (e.touches.length === 2 && zoomed) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, [zoomed]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    touchMoved.current = true;

    if (e.touches.length === 2 && zoomed) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (lastPinchDist.current > 0) {
        const ratio = dist / lastPinchDist.current;
        setZoomLevel((prev) => {
          const next = prev * ratio;
          return Math.min(maxZoom, Math.max(minZoom, next));
        });
      }
      lastPinchDist.current = dist;

      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const pos = getPos(cx, cy);
      if (pos) setOrigin(pos);
    } else if (e.touches.length === 1 && zoomed) {
      const pos = getPos(e.touches[0].clientX, e.touches[0].clientY);
      if (pos) setOrigin(pos);
    }
  }, [zoomed, getPos, minZoom, maxZoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    lastPinchDist.current = 0;
    if (!touchMoved.current) {
      setZoomed((prev) => {
        if (!prev) {
          const t = e.changedTouches[0];
          const pos = getPos(t.clientX, t.clientY);
          if (pos) setOrigin(pos);
          setZoomLevel(2.5);
        }
        return !prev;
      });
    }
  }, [getPos]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
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
        animate={{ scale: zoomed ? zoomLevel : 1 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
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

      {!zoomed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
          <div className="bg-obsidian/80 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-wider text-gold/60 uppercase border border-gold/20 whitespace-nowrap">
            <span>{lang === "ar" ? "اضغط للتكبير" : "Tap to zoom"}</span>
          </div>
        </div>
      )}

      {zoomed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gold/80 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-wider text-obsidian font-semibold uppercase border border-gold whitespace-nowrap">
            <span>{lang === "ar" ? "اضغط للتصغير" : "Tap to zoom out"}</span>
          </div>
        </div>
      )}

      {zoomed && (
        <div className="absolute top-4 right-4 z-10 bg-obsidian/70 backdrop-blur-sm px-2 py-1 text-[9px] text-gold/40 tracking-wider border border-gold/10 rounded">
          {zoomLevel.toFixed(1)}x
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
