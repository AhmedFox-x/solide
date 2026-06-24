import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Props {
  variant?: "wave" | "angle" | "fade";
}

const WAVE = "M0,96L48,85.3C96,75,192,53,288,58.7C384,64,480,96,576,106.7C672,117,768,107,864,96C960,85,1056,75,1152,80C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z";
const ANGLE = "M0,224L60,213.3C120,203,240,181,360,176C480,171,600,181,720,197.3C840,213,960,235,1080,229.3C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z";

export default function SectionDivider({ variant = "wave" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 1]);

  return (
    <motion.div ref={ref} style={{ opacity }} className="relative w-full h-20 md:h-28 -mb-1 pointer-events-none">
      <svg
        viewBox="0 0 1440 320"
        className="absolute w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d={variant === "angle" ? ANGLE : WAVE}
          fill="url(#goldGrad)"
          opacity={0.04}
        />
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C8963C" stopOpacity={0} />
            <stop offset="50%" stopColor="#C8963C" stopOpacity={1} />
            <stop offset="100%" stopColor="#C8963C" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
