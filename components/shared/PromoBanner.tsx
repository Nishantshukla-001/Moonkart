"use client";

import { motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/shared/Reveal";

interface PromoBannerProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  ctaLabel: string;
  ctaHref: string;
  background: StaticImageData;
}

export function PromoBanner({
  eyebrow,
  heading,
  subheading,
  ctaLabel,
  ctaHref,
  background,
}: PromoBannerProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal className="relative overflow-hidden rounded-card shadow-soft-lg">
          {/* Layered blush-to-cream gradient base */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-blush via-blush-light to-warm-yellow/25"
          />
          {/* Warm radial glow, campaign-style lighting */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 w-[70%] bg-radial from-warm-yellow/35 via-transparent to-transparent blur-2xl"
          />
          <Image
            src={background}
            alt=""
            fill
            className="object-cover opacity-[0.06] mix-blend-multiply"
            aria-hidden="true"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-white/30"
          />

          {/* Soft glow blobs for depth */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -left-14 size-72 rounded-full bg-white/50 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -bottom-24 size-80 rounded-full bg-blush-hover/40 blur-3xl"
          />

          {/* Delicate petal accents */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-10 left-10 size-10 rotate-[20deg] rounded-tl-full rounded-tr-full rounded-br-full bg-blush-hover/30 blur-[2px] sm:top-14 sm:left-16"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-16 bottom-14 size-7 -rotate-[15deg] rounded-tl-full rounded-tr-full rounded-bl-full bg-white/60 blur-[1px] sm:right-24"
          />

          {/* Jewellery-inspired abstract rings */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 hidden size-16 -translate-x-[220px] -translate-y-1/2 rounded-full border border-blush-hover/40 sm:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 hidden size-24 translate-x-[190px] -translate-y-[70%] rounded-full border border-blush-hover/25 sm:block"
          />

          {/* Pearl-inspired accent dots */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[22%] right-[26%] hidden size-2.5 rounded-full bg-gradient-to-br from-white to-blush-light shadow-soft ring-1 ring-white/70 sm:block"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[30%] bottom-[24%] hidden size-1.5 rounded-full bg-gradient-to-br from-white to-blush-light shadow-soft ring-1 ring-white/70 sm:block"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[30%] left-[12%] size-2 rounded-full bg-gradient-to-br from-white to-blush-light shadow-soft ring-1 ring-white/70"
          />

          <motion.div
            aria-hidden="true"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute top-8 right-[18%]"
          >
            <Sparkles className="size-5 text-white/80" />
          </motion.div>
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="pointer-events-none absolute bottom-10 left-[16%]"
          >
            <Sparkles className="size-4 text-blush-hover/60" />
          </motion.div>

          <div className="relative flex flex-col items-center gap-4 px-6 py-20 text-center sm:py-24">
            {eyebrow && (
              <span className="flex items-center gap-2 text-sm font-semibold tracking-[0.3px] text-blush-hover uppercase">
                <span className="h-px w-8 bg-blush-hover/60" aria-hidden="true" />
                {eyebrow}
                <span className="h-px w-8 bg-blush-hover/60" aria-hidden="true" />
              </span>
            )}
            <h2 className="max-w-xl text-3xl leading-[120%] font-bold tracking-tight text-text-primary sm:text-4xl">
              {heading}
            </h2>
            {subheading && (
              <p className="max-w-md text-base leading-[160%] text-text-secondary">
                {subheading}
              </p>
            )}
            <Button
              size="lg"
              className="mt-2 bg-gradient-to-r from-blush-hover to-blush shadow-soft-lg hover:-translate-y-0.5 hover:shadow-soft-lg"
              render={<Link href={ctaHref} />}
            >
              {ctaLabel}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
