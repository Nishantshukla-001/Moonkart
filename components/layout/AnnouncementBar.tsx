"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { luxeEase } from "@/lib/motion";

const messages = [
  "Free shipping on prepaid orders above ₹999",
  "New arrivals added every week",
  "Handcrafted elegance, delivered to your door",
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative flex h-10 items-center justify-center gap-2 overflow-hidden rounded-b-2xl px-4 text-center shadow-soft"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, var(--blush-light) 0px, var(--blush-light) 18px, var(--blush) 18px, var(--blush) 36px)",
      }}
    >
      <span className="relative flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 backdrop-blur-sm">
        <Sparkles className="size-3.5 shrink-0 text-text-primary/60" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: luxeEase }}
            className="font-heading text-xs font-medium tracking-[0.3px] text-text-primary sm:text-sm"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </span>
    </div>
  );
}
