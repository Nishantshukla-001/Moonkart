"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

import { luxeEase } from "@/lib/motion";

interface AnnouncementBarProps {
  text: string | null;
  link: string | null;
  isEnabled: boolean;
}

/** CMS-driven — Admin → Homepage Content controls the text/link/enabled state. Renders nothing when disabled or empty. */
export function AnnouncementBar({ text, link, isEnabled }: AnnouncementBarProps) {
  if (!isEnabled || !text) return null;

  const content = (
    <span className="relative flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 backdrop-blur-sm">
      <Sparkles className="size-3.5 shrink-0 text-text-primary/60" aria-hidden="true" />
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: luxeEase }}
        className="font-heading text-xs font-medium tracking-[0.3px] text-text-primary sm:text-sm"
      >
        {text}
      </motion.span>
    </span>
  );

  return (
    <div
      className="relative flex h-10 items-center justify-center gap-2 overflow-hidden rounded-b-2xl px-4 text-center shadow-soft"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, var(--blush-light) 0px, var(--blush-light) 18px, var(--blush) 18px, var(--blush) 36px)",
      }}
    >
      {link ? <Link href={link}>{content}</Link> : content}
    </div>
  );
}
