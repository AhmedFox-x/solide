import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type Shape = "hexagon" | "diamond" | "triangle" | "octagon";

interface GeoShape {
  id: number;
  shape: Shape;
  x: number;
  y: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
  opacity: number;
}

const CLIP_PATHS: Record<Shape, string> = {
  hexagon: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  triangle: "polygon(50% 0%, 100% 100%, 0% 100%)",
  octagon:
    "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
};

const SHAPES: Shape[] = ["hexagon", "diamond", "triangle", "octagon"];

function generateShapes(count: number): GeoShape[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    shape: SHAPES[i % SHAPES.length],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 30 + Math.random() * 60,
    rotation: Math.random() * 360,
    duration: 12 + Math.random() * 20,
    delay: Math.random() * 10,
    opacity: 0.03 + Math.random() * 0.07,
  }));
}

function FloatingShape({ shape }: { shape: GeoShape }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${shape.x}%`,
        top: `${shape.y}%`,
        width: shape.size,
        height: shape.size,
        clipPath: CLIP_PATHS[shape.shape],
        background:
          shape.id % 3 === 0
            ? "linear-gradient(135deg, #C8963C, #E0B050)"
            : shape.id % 3 === 1
              ? "linear-gradient(135deg, #F2E8D0, #C8B88A)"
              : "linear-gradient(135deg, #4A5568, #718096)",
        opacity: shape.opacity,
      }}
      animate={{
        y: [0, -20, 0, 12, 0],
        rotate: [shape.rotation, shape.rotation + 180, shape.rotation + 360],
        scale: [1, 1.08, 0.95, 1],
      }}
      transition={{
        duration: shape.duration,
        repeat: Infinity,
        delay: shape.delay,
        ease: "easeInOut",
      }}
    />
  );
}

export default function GeometricBg({ count = 18 }: { count?: number }) {
  const shapes = useRef(generateShapes(count)).current;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {shapes.map((s) => (
        <FloatingShape key={s.id} shape={s} />
      ))}
    </div>
  );
}

/* ---------- 3D tilt card wrapper ---------- */
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export function TiltCard({ children, className = "" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
