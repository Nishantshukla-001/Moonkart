import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Us",
  description: "About MoonKart.",
};

export default function AboutPage() {
  return (
    <Container className="flex flex-col items-center py-16 sm:py-20">
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-[34px]">
          About MoonKart
        </h1>
        <span aria-hidden="true" className="h-px w-12 bg-blush" />
      </div>

      <Card className="mt-10 flex w-full max-w-2xl flex-col items-center gap-5 p-8 text-center sm:p-10">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blush">
          <Sparkles className="size-5 text-text-primary" aria-hidden="true" />
        </span>

        <p className="text-base leading-[170%] text-text-secondary">
          MoonKart is your destination for stylish beauty essentials, makeup, jewellery, and
          accessories. We carefully curate every product to bring you quality, elegance, and
          value in one place.
        </p>
      </Card>
    </Container>
  );
}
