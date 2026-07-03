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
    <div className="flex h-10 items-center justify-center gap-2 overflow-hidden bg-gradient-to-r from-blush-light via-blush to-blush-light px-4 text-center">
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
    </div>
  );
}
