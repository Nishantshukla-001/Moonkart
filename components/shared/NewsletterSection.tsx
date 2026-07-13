"use client";

import { motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { Sparkles } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { Reveal } from "@/components/shared/Reveal";

interface NewsletterSectionProps {
  heading: string;
  subheading?: string;
  background: StaticImageData;
}

export function NewsletterSection({ heading, subheading, background }: NewsletterSectionProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal className="relative overflow-hidden rounded-card shadow-soft-lg">
          {/* Layered gradient base — cream into blush, softer than the sale banner */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-blush-light via-background to-blush/20"
          />
          <Image
            src={background}
            alt=""
            fill
            className="object-cover opacity-[0.05] mix-blend-multiply"
            aria-hidden="true"
          />

          {/* Soft radial highlight behind the form, drawing focus to the CTA */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-72 w-[80%] bg-radial from-white/70 via-transparent to-transparent"
          />

          {/* Blurred decorative circles for depth */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 right-10 size-64 rounded-full bg-blush/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-4.5rem] left-6 size-56 rounded-full bg-warm-yellow/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 hidden size-20 -translate-x-[260px] -translate-y-1/2 rounded-full border border-blush-hover/25 md:block"
          />

          <motion.div
            aria-hidden="true"
            animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute top-10 left-[14%]"
          >
            <Sparkles className="size-4 text-blush-hover/60" />
          </motion.div>
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, 6, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="pointer-events-none absolute right-[16%] bottom-12"
          >
            <Sparkles className="size-5 text-white/80" />
          </motion.div>

          <div className="relative flex flex-col items-center gap-4 px-6 py-20 text-center sm:py-24">
            <h2 className="bg-gradient-to-r from-blush-hover via-blush to-blush-hover bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-[32px]">
              {heading}
            </h2>
            {subheading && (
              <p className="max-w-md text-base leading-[160%] text-text-secondary">
                {subheading}
              </p>
            )}
            <NewsletterForm variant="large" className="mt-2" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
