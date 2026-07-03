"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { StaticImageData } from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { AspectImage } from "@/components/shared/AspectImage";
import { fadeInUp, luxeEase, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageSrc?: string | StaticImageData;
  imageAlt?: string;
  background?: "sage" | "blush" | "yellow";
  className?: string;
}

const backgroundClasses = {
  sage: "bg-gradient-to-br from-sage-light/60 via-background to-blush/25",
  blush: "bg-gradient-to-br from-blush/40 via-background to-warm-yellow/15",
  yellow: "bg-gradient-to-br from-warm-yellow/40 via-background to-blush/20",
} as const;

export function HeroSection({
  eyebrow,
  heading,
  subheading,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  imageSrc,
  imageAlt = "",
  background = "blush",
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-card",
        backgroundClasses[background],
        className
      )}
    >
      {/* Decorative layered background accents — purely visual, no content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-16 size-80 rounded-full bg-blush/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-24 size-72 rounded-full bg-blush-hover/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-1/4 size-40 rounded-full bg-warm-yellow/25 blur-2xl"
      />

      <Container className="relative grid grid-cols-1 items-center gap-12 py-20 md:grid-cols-2 md:py-28 lg:py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-start gap-6"
        >
          {eyebrow && (
            <motion.span
              variants={fadeInUp}
              className="flex items-center gap-2 text-sm font-semibold tracking-[0.4px] text-blush-hover uppercase"
            >
              <span className="h-px w-8 bg-blush-hover" aria-hidden="true" />
              {eyebrow}
            </motion.span>
          )}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl leading-[118%] font-bold tracking-tight text-text-primary md:text-5xl lg:text-[64px]"
          >
            {heading}
          </motion.h1>
          {subheading && (
            <motion.p
              variants={fadeInUp}
              className="max-w-md text-lg leading-[160%] text-text-secondary"
            >
              {subheading}
            </motion.p>
          )}
          {(ctaLabel || secondaryCtaLabel) && (
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 pt-2">
              {ctaLabel && ctaHref && (
                <Button size="lg" className="group/cta" render={<Link href={ctaHref} />}>
                  {ctaLabel}
                  <ArrowRight className="transition-transform duration-[250ms] group-hover/cta:translate-x-1" />
                </Button>
              )}
              {secondaryCtaLabel && secondaryCtaHref && (
                <Button size="lg" variant="secondary" render={<Link href={secondaryCtaHref} />}>
                  {secondaryCtaLabel}
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>

        {imageSrc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: luxeEase, delay: 0.15 }}
            className="relative w-full"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-4 -z-10 rounded-image bg-gradient-to-tr from-blush/50 via-warm-yellow/25 to-blush-hover/30 blur-2xl"
            />
            <div className="rounded-image shadow-soft-lg ring-1 ring-white/60">
              <AspectImage src={imageSrc} alt={imageAlt} ratio="square" priority />
            </div>

            <motion.div
              aria-hidden="true"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-5 -right-5 flex size-16 items-center justify-center rounded-full bg-background shadow-soft-lg ring-1 ring-blush/40"
            >
              <Sparkles className="size-6 text-blush" />
            </motion.div>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
