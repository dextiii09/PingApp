import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Use type intersection instead of interface extension for better compatibility with Framer Motion types
export type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  fullWidth?: boolean;
  children?: React.ReactNode;
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  style,
  ...props 
}: ButtonProps) => {
  const baseStyles = "relative font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed tracking-wide transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/50 rounded-full border border-white/10 group",
    secondary: "bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 hover:bg-white dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-full shadow-sm dark:shadow-none",
    ghost: "bg-transparent text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl",
    icon: "bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white rounded-full p-3 aspect-square hover:bg-white dark:hover:bg-white/20 hover:scale-105 shadow-sm dark:shadow-none"
  };

  const sizes = variant === 'icon' ? '' : 'px-8 py-4';
  const width = fullWidth ? 'w-full' : '';

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`${baseStyles} ${variants[variant]} ${sizes} ${width} ${className}`}
      style={{ willChange: 'transform', ...style }}
      {...props}
    >
      {children}
      {variant === 'primary' && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </motion.button>
  );
};