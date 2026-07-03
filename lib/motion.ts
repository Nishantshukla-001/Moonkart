import type { Easing, Variants } from "framer-motion";

/**
 * Refined "expo-out" deceleration curve — the smooth, unhurried settle used
 * by premium DTC brands (durations stay within design/Components.md's
 * documented 0.25s hover / 0.4s page-transition range; only the easing
 * quality changes).
 */
export const luxeEase: Easing = [0.16, 1, 0.3, 1];

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: luxeEase },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};
