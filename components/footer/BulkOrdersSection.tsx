import { Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { contactInfo } from "@/constants/config";

export function BulkOrdersSection() {
  const whatsappNumber = contactInfo.whatsapp.replace(/\D/g, "");

  return (
    <section className="border-t border-border-light bg-gradient-to-b from-blush-light/50 via-blush-light/15 to-transparent py-14 sm:py-16">
      <Container className="flex flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-2">
          <Gift className="size-5 text-blush-hover" aria-hidden="true" />
          <h2 className="font-heading text-xl font-semibold text-text-primary sm:text-2xl">
            For Bulk Orders &amp; Return Gifts 🎁
          </h2>
        </div>

        <Button
          size="lg"
          render={
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" />
          }
          className="h-14 rounded-full px-10 text-lg hover:-translate-y-1 hover:shadow-soft-lg"
        >
          WhatsApp Us 💌
        </Button>

        <p className="text-sm leading-[160%] font-medium text-text-muted">
          Important:
          <br />
          No Return or Refund
        </p>
      </Container>
    </section>
  );
}
