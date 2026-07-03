import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CollectionCard } from "@/components/shared/CollectionCard";
import { HeroSection } from "@/components/shared/HeroSection";
import { InstagramGallery } from "@/components/shared/InstagramGallery";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { PromoBanner } from "@/components/shared/PromoBanner";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { WhyChooseUs } from "@/components/shared/WhyChooseUs";
import { ProductSection } from "@/components/products/ProductSection";
import { ROUTES } from "@/constants/routes";
import {
  heroContent,
  homepageSections,
  newsletterContent,
  promoBannerContent,
  whyChooseUsFeatures,
} from "@/lib/homepageContent";
import {
  bestSellerProducts,
  categories,
  featuredCollections,
  instagramImages,
  newArrivalProducts,
  testimonials,
  trendingProducts,
} from "@/lib/placeholderData";

export const metadata: Metadata = {
  title: "Premium Fashion, Jewellery & Beauty Marketplace",
  description:
    "Discover elegant jewellery, beauty essentials, and fashion at MoonKart — a premium marketplace curated for the modern woman.",
};

export default function HomePage() {
  return (
    <>
      <div className="pt-8">
        <Container>
          <HeroSection
            eyebrow={heroContent.eyebrow}
            heading={heroContent.heading}
            subheading={heroContent.subheading}
            ctaLabel={heroContent.ctaLabel}
            ctaHref={heroContent.ctaHref}
            secondaryCtaLabel={heroContent.secondaryCtaLabel}
            secondaryCtaHref={heroContent.secondaryCtaHref}
            imageSrc={heroContent.image}
            imageAlt={heroContent.imageAlt}
            background="blush"
          />
        </Container>
      </div>

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal className="mb-10 flex flex-col items-center gap-2 text-center sm:mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
              {homepageSections.featuredCategories.title}
            </h2>
            <p className="max-w-lg text-base text-text-secondary">
              {homepageSections.featuredCategories.subtitle}
            </p>
          </Reveal>

          <Reveal
            stagger
            className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-6"
          >
            {categories.map((category) => (
              <RevealItem key={category.slug}>
                <CategoryCard
                  name={category.name}
                  slug={category.slug}
                  image={category.image}
                  productCount={category.productCount}
                />
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      <ProductSection
        title={homepageSections.trending.title}
        subtitle={homepageSections.trending.subtitle}
        products={trendingProducts}
        viewAllHref={ROUTES.products}
        background="blush"
      />

      <ProductSection
        title={homepageSections.newArrivals.title}
        subtitle={homepageSections.newArrivals.subtitle}
        products={newArrivalProducts}
        viewAllHref={ROUTES.products}
      />

      <PromoBanner
        eyebrow={promoBannerContent.eyebrow}
        heading={promoBannerContent.heading}
        subheading={promoBannerContent.subheading}
        ctaLabel={promoBannerContent.ctaLabel}
        ctaHref={promoBannerContent.ctaHref}
        background={promoBannerContent.background}
      />

      <ProductSection
        title={homepageSections.bestSellers.title}
        subtitle={homepageSections.bestSellers.subtitle}
        products={bestSellerProducts}
        viewAllHref={ROUTES.products}
        background="cream"
      />

      <section className="bg-gradient-to-b from-blush-light via-blush-light/40 to-transparent py-16 sm:py-20">
        <Container>
          <Reveal className="mb-10 flex flex-col items-center gap-2 text-center sm:mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
              {homepageSections.featuredCollections.title}
            </h2>
            <p className="max-w-lg text-base text-text-secondary">
              {homepageSections.featuredCollections.subtitle}
            </p>
          </Reveal>

          <Reveal
            stagger
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {featuredCollections.map((collection) => (
              <RevealItem key={collection.slug}>
                <CollectionCard
                  name={collection.name}
                  slug={collection.slug}
                  image={collection.image}
                  description={collection.description}
                />
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      <WhyChooseUs features={whyChooseUsFeatures} subtitle={homepageSections.whyChooseUs.subtitle} />

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal className="mb-10 flex flex-col items-center gap-2 text-center sm:mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
              {homepageSections.testimonials.title}
            </h2>
            <p className="max-w-lg text-base text-text-secondary">
              {homepageSections.testimonials.subtitle}
            </p>
          </Reveal>

          <Reveal stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial) => (
              <RevealItem key={testimonial.name}>
                <TestimonialCard {...testimonial} />
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      <InstagramGallery images={instagramImages} />

      <NewsletterSection
        heading={newsletterContent.heading}
        subheading={newsletterContent.subheading}
        background={newsletterContent.background}
      />
    </>
  );
}
