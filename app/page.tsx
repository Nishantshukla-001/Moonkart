import type { Metadata } from "next";

import heroBannerImage from "@/assets/moonkart-hero-banner.png";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { Container } from "@/components/layout/Container";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { InstagramGallery } from "@/components/shared/InstagramGallery";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { PromoBanner } from "@/components/shared/PromoBanner";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { WhyChooseUs } from "@/components/shared/WhyChooseUs";
import { ProductSection } from "@/components/products/ProductSection";
import { ROUTES } from "@/constants/routes";
import {
  getBestSellers,
  getFeaturedProducts,
  getNewArrivals,
  getTrendingProducts,
} from "@/features/products/services/product.service";
import {
  homepageSections,
  newsletterContent,
  promoBannerContent,
  whyChooseUsFeatures,
} from "@/lib/homepageContent";
import { categories, instagramImages, testimonials } from "@/lib/placeholderData";

export const metadata: Metadata = {
  title: "Premium Fashion, Jewellery & Beauty Marketplace",
  description:
    "Discover elegant jewellery, beauty essentials, and fashion at MoonKart — a premium marketplace curated for the modern woman.",
};

// ISR: homepage product sections are re-generated in the background at most
// once a minute, so admin edits/creates (which also call revalidatePath("/")
// — see app/api/admin/products routes) show up immediately, while ordinary
// traffic serves a cached page instead of hitting Prisma on every request.
export const revalidate = 60;

export default async function HomePage() {
  const [trendingProducts, newArrivalProducts, bestSellerProducts, featuredProducts] = await Promise.all([
    getTrendingProducts(8),
    getNewArrivals(8),
    getBestSellers(8),
    getFeaturedProducts(8),
  ]);

  return (
    <>
      <div className="pt-8 pb-4 sm:pb-6">
        <HeroBanner image={heroBannerImage} href="#explore" />
      </div>

      <section id="explore" className="py-16 sm:py-20">
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
        viewAllHref={`${ROUTES.products}?section=trending`}
        background="blush"
      />

      <ProductSection
        title={homepageSections.newArrivals.title}
        subtitle={homepageSections.newArrivals.subtitle}
        products={newArrivalProducts}
        viewAllHref={`${ROUTES.products}?section=new-arrivals`}
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
        viewAllHref={`${ROUTES.products}?section=best-sellers`}
        background="cream"
      />

      <ProductSection
        title={homepageSections.featuredCollections.title}
        subtitle={homepageSections.featuredCollections.subtitle}
        products={featuredProducts}
        viewAllHref={`${ROUTES.products}?section=featured`}
        background="blush"
      />

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
