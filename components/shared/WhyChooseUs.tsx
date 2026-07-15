import { Container } from "@/components/layout/Container";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { siteConfig } from "@/constants/config";
import type { FeatureHighlight } from "@/lib/homepageContent";

interface WhyChooseUsProps {
  features: FeatureHighlight[];
  subtitle?: string;
}

export function WhyChooseUs({ features, subtitle }: WhyChooseUsProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            title={`Why Choose ${siteConfig.name}`}
            subtitle={subtitle}
            className="mb-10 sm:mb-12"
          />
        </Reveal>

        <Reveal stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <RevealItem
              key={feature.title}
              className="group flex flex-col items-center gap-3 rounded-[24px] bg-background/80 px-6 py-10 text-center shadow-soft ring-1 ring-blush-light transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:bg-background hover:shadow-soft-md hover:ring-blush-hover/40"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-sage-light transition-transform duration-[250ms] ease-out group-hover:scale-110">
                <feature.icon className="size-7 text-sage" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-[160%] text-text-secondary">{feature.description}</p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
