import type { Metadata } from "next";
import { AlertCircle, PackageX, Video } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "MoonKart's return and refund policy.",
};

const conditions = [
  { icon: PackageX, text: "If product is 90% damaged." },
  { icon: Video, text: "Unboxing video is required from the beginning of opening the parcel." },
  { icon: AlertCircle, text: "A continuous 360° unboxing video without cuts is mandatory." },
];

export default function ReturnRefundPolicyPage() {
  return (
    <Container className="flex flex-col items-center py-16 sm:py-20">
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-[34px]">
          Return &amp; Refund Policy
        </h1>
        <span aria-hidden="true" className="h-px w-12 bg-blush" />
      </div>

      <Card className="mt-10 w-full max-w-2xl gap-6 p-8 sm:p-10">
        <div className="flex flex-col gap-3 text-center">
          <h2 className="font-heading text-xl font-semibold text-text-primary">Refund Policy</h2>
          <p className="text-base leading-[170%] text-text-secondary">
            We do not offer returns or exchanges.
          </p>
          <p className="text-base leading-[170%] text-text-secondary">
            Refund will be initiated only under the following conditions:
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {conditions.map((condition) => (
            <li
              key={condition.text}
              className="flex items-start gap-3 rounded-lg bg-blush-light/40 px-4 py-3.5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blush">
                <condition.icon className="size-4 text-text-primary" aria-hidden="true" />
              </span>
              <span className="pt-1 text-sm leading-[160%] text-text-primary">{condition.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </Container>
  );
}
