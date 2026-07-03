"use client";

import { motion } from "framer-motion";

import { fadeInUp, staggerContainer } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
}

/**
 * Scroll-reveal wrapper used across homepage sections for consistent,
 * subtle entrance animation (design/Components.md: smooth animations, 0.25-0.4s).
 */
export function Reveal({ children, className, delay = 0, stagger = false }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={stagger ? staggerContainer : fadeInUp}
      transition={stagger ? undefined : { delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeInUp}>
      {children}
    </motion.div>
  );
}
