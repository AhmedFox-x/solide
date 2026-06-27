import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  src: string;
  alt: string;
  zoom?: number;
  lensSize?: number;
  onClick?: () => void;
  className?: string;
  lang?: "en" | "ar";
}

export default function ImageMagnifier({
  src, alt, zoom = 2.5, lensSize = 140, onClick, className = "", lang = "ar",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLens({ x, y, show: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setLens((prev) => ({ ...prev, show: false }));
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden cursor-none group ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain select-none"
        draggable={false}
        style={{ maxHeight: 600 }}
      />

      {lens.show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none absolute z-20 rounded-full border-2 border-gold/40 shadow-[0_0_30px_rgba(200,150,60,0.15)]"
          style={{
            width: lensSize,
            height: lensSize,
            left: `calc(${lens.x}% - ${lensSize / 2}px)`,
            top: `calc(${lens.y}% - ${lensSize / 2}px)`,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
            backgroundPosition: `${lens.x}% ${lens.y}%`,
            backdropFilter: "blur(0px)",
          }}
        />
      )}

      {!lens.show && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
          <div className="bg-obsidian/80 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-wider text-gold/60 uppercase border border-gold/20 whitespace-nowrap">
            <span>{lang === "ar" ? "حرك المؤشر للتكبير" : "Hover to zoom"}</span>
          </div>
        </div>
      )}

      {lens.show && (
        <div className="absolute top-4 right-4 z-10 bg-obsidian/70 backdrop-blur-sm px-2 py-1 text-[9px] text-gold/40 tracking-wider border border-gold/10 rounded">
          {zoom}x
        </div>
      )}
    </div>
  );
}
