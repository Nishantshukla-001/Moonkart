import { Container } from "@/components/layout/Container";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { siteConfig } from "@/constants/config";
import type { FeatureHighlight } from "@/lib/homepageContent";

interface WhyChooseUsProps {
  features: FeatureHighlight[];
  subtitle?: string;
}

export function WhyChooseUs({ features, subtitle }: WhyChooseUsProps) {
  return (
    <section className="bg-bg-section py-16 sm:py-20">
      <Container>
        <Reveal className="mb-10 flex flex-col items-center gap-2 text-center sm:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
            Why Choose {siteConfig.name}
          </h2>
          {subtitle && <p className="max-w-lg text-base text-text-secondary">{subtitle}</p>}
        </Reveal>

        <Reveal stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <RevealItem
              key={feature.title}
              className="group flex flex-col items-center gap-3 rounded-card bg-background px-6 py-10 text-center shadow-soft transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:shadow-soft-md"
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
