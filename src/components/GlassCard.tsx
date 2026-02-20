
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  intensity = 'medium',
  onClick,
  hoverEffect = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseStyles = "relative overflow-hidden transition-all duration-300 border";
  
  const intensityStyles = {
    low: "bg-white/40 dark:bg-black/20 backdrop-blur-md border-white/20 dark:border-white/5",
    medium: "bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/30 dark:border-white/10",
    high: "bg-white/80 dark:bg-black/60 backdrop-blur-2xl border-white/40 dark:border-white/15"
  };

  const hoverStyles = hoverEffect ? "hover:shadow-xl hover:bg-white/70 dark:hover:bg-white/10" : "";
  const cursorStyle = onClick || hoverEffect ? "cursor-pointer" : "";

  const motionProps = hoverEffect ? {
    style: {
      rotateX,
      rotateY,
      transformStyle: "preserve-3d",
      transform: 'translateZ(0)', // Promote to new layer
      willChange: 'transform' // Performance optimization
    } as any,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave
  } : {};

  return (
    <motion.div 
      ref={ref}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${intensityStyles[intensity]}
        ${hoverStyles}
        ${cursorStyle}
        shadow-sm dark:shadow-black/40
        rounded-[2rem]
        ${className}
      `}
      whileHover={hoverEffect ? { scale: 1.03 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      {...motionProps}
    >
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};
