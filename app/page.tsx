import type { Metadata } from "next";

import heroBannerImage from "@/assets/moonkart-hero-banner.png";
import { FeaturedCategoryCard } from "@/components/categories/FeaturedCategoryCard";
import { Container } from "@/components/layout/Container";
import { FloatingDoodles } from "@/components/shared/FloatingDoodles";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { InstagramGallery } from "@/components/shared/InstagramGallery";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { PastelBackdrop } from "@/components/shared/PastelBackdrop";
import { PromoBanner } from "@/components/shared/PromoBanner";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { WhyChooseUs } from "@/components/shared/WhyChooseUs";
import { ProductSection } from "@/components/products/ProductSection";
import { ROUTES } from "@/constants/routes";
import {
  getBestSellers,
  getNewArrivals,
} from "@/features/products/services/product.service";
import { getVisibleInstagramPosts } from "@/features/instagram/services/instagramPost.service";
import {
  homepageSections,
  newsletterContent,
  promoBannerContent,
  whyChooseUsFeatures,
} from "@/lib/homepageContent";
import { categories, moonEssentialsSubcategories, testimonials } from "@/lib/placeholderData";

export const metadata: Metadata = {
  title: "Premium Fashion, Jewellery & Beauty Marketplace",
  description:
    "Discover elegant jewellery, beauty essentials, and fashion at MoonKart — a premium marketplace curated for the modern woman.",
};

// Reused on every homepage section background so the "pastel gradient" heading and floating doodles read consistently across the page.
const GRADIENT_HEADING_CLASS =
  "bg-gradient-to-r from-blush-hover via-blush to-blush-hover bg-clip-text text-transparent";

// ISR: homepage product sections are re-generated in the background at most
// once a minute, so admin edits/creates (which also call revalidatePath("/")
// — see app/api/admin/products routes) show up immediately, while ordinary
// traffic serves a cached page instead of hitting Prisma on every request.
export const revalidate = 60;

export default async function HomePage() {
  const [newArrivalProducts, bestSellerProducts, instagramPosts] = await Promise.all([
    getNewArrivals(8),
    getBestSellers(8),
    getVisibleInstagramPosts(8),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-sage-light via-blush-light/70 to-background pt-10 pb-10 sm:pt-14 sm:pb-14">
        <PastelBackdrop />
        <FloatingDoodles />
        <HeroBanner image={heroBannerImage} href="#explore" />
      </section>

      <section
        id="explore"
        className="relative overflow-hidden bg-gradient-to-br from-sage-light/70 via-background to-blush-light/60 py-16 sm:py-20"
      >
        <PastelBackdrop />
        <FloatingDoodles />
        <Container>
          <Reveal>
            <SectionHeading
              title={homepageSections.featuredCategories.title}
              subtitle={homepageSections.featuredCategories.subtitle}
              className="mb-10 sm:mb-12"
            />
          </Reveal>

          <Reveal
            stagger
            className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-6"
          >
            {categories.map((category) => (
              <RevealItem key={category.slug}>
                <FeaturedCategoryCard
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

      <section className="relative overflow-hidden bg-gradient-to-tr from-blush-light via-warm-yellow/20 to-sage-light/60 py-16 sm:py-20">
        <PastelBackdrop />
        <FloatingDoodles />
        <Container>
          <Reveal>
            <SectionHeading
              title={homepageSections.moonEssentials.title}
              subtitle={homepageSections.moonEssentials.subtitle}
              className="mb-10 sm:mb-12"
            />
          </Reveal>

          <Reveal
            stagger
            className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-4"
          >
            {moonEssentialsSubcategories.map((subcategory) => (
              <RevealItem key={subcategory.slug}>
                <FeaturedCategoryCard
                  name={subcategory.name}
                  slug={subcategory.slug}
                  image={subcategory.image}
                  href={`${ROUTES.category("moon-essentials")}?subCategory=${subcategory.slug}`}
                />
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      <div className="relative overflow-hidden bg-gradient-to-b from-background to-blush-light/30">
        <PastelBackdrop />
        <FloatingDoodles />
        <ProductSection
          title={homepageSections.newArrivals.title}
          subtitle={homepageSections.newArrivals.subtitle}
          products={newArrivalProducts}
          viewAllHref={`${ROUTES.products}?section=new-arrivals`}
          headingClassName={GRADIENT_HEADING_CLASS}
        />
      </div>

      <PromoBanner
        eyebrow={promoBannerContent.eyebrow}
        heading={promoBannerContent.heading}
        subheading={promoBannerContent.subheading}
        ctaLabel={promoBannerContent.ctaLabel}
        ctaHref={promoBannerContent.ctaHref}
        background={promoBannerContent.background}
      />

      <div className="relative overflow-hidden bg-gradient-to-b from-sage-light/50 via-background to-warm-yellow/15">
        <PastelBackdrop />
        <FloatingDoodles />
        <ProductSection
          title={homepageSections.bestSellers.title}
          subtitle={homepageSections.bestSellers.subtitle}
          products={bestSellerProducts}
          viewAllHref={`${ROUTES.products}?section=best-sellers`}
          background="white"
          headingClassName={GRADIENT_HEADING_CLASS}
        />
      </div>

      <WhyChooseUs features={whyChooseUsFeatures} subtitle={homepageSections.whyChooseUs.subtitle} />

      <section className="relative overflow-hidden bg-gradient-to-br from-blush-light/60 via-background to-sage-light/50 py-16 sm:py-20">
        <PastelBackdrop />
        <FloatingDoodles />
        <Container>
          <Reveal>
            <SectionHeading
              title={homepageSections.testimonials.title}
              subtitle={homepageSections.testimonials.subtitle}
              className="mb-10 sm:mb-12"
            />
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

      <InstagramGallery images={instagramPosts.map((post) => post.imageUrl)} />

      <NewsletterSection
        heading={newsletterContent.heading}
        subheading={newsletterContent.subheading}
        background={newsletterContent.background}
      />
    </>
  );
}
