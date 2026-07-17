import type { Metadata } from "next";

import heroBannerImage from "@/assets/moonkart-hero-banner.png";
import pinkTexture from "@/assets/pinkcolor.jpeg";
import { FeaturedCategoryCard } from "@/components/categories/FeaturedCategoryCard";
import { Container } from "@/components/layout/Container";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { HomepageBackground } from "@/components/shared/HomepageBackground";
import { InstagramGallery } from "@/components/shared/InstagramGallery";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { PromoBanner } from "@/components/shared/PromoBanner";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { WhyChooseUs } from "@/components/shared/WhyChooseUs";
import { ProductSection } from "@/components/products/ProductSection";
import { ROUTES } from "@/constants/routes";
import { getCategories, getCategoryBySlug } from "@/features/categories/services/category.service";
import {
  getFeaturedCategoriesForHomepage,
  getFeaturedSubCategoriesForHomepage,
} from "@/features/homepage/services/featuredCategory.service";
import { getHomepageContent } from "@/features/homepage/services/homepageContent.service";
import { getVisibleInstagramPosts } from "@/features/instagram/services/instagramPost.service";
import {
  getBestSellers,
  getNewArrivals,
} from "@/features/products/services/product.service";
import { whyChooseUsFeatures } from "@/lib/homepageContent";
import { placeholderImage } from "@/lib/placeholderImages";
import { testimonials } from "@/lib/placeholderData";

export const metadata: Metadata = {
  title: "Premium Fashion, Jewellery & Beauty Marketplace",
  description:
    "Discover elegant jewellery, beauty essentials, and fashion at MoonKart — a premium marketplace curated for the modern woman.",
};

// Reused on every homepage section heading so the "pastel gradient" title reads consistently across the page.
const GRADIENT_HEADING_CLASS =
  "bg-gradient-to-r from-blush-deep via-blush-deep-hover to-blush-deep bg-clip-text text-transparent [text-shadow:_0_1px_3px_rgb(255_255_255_/_70%)]";

// ISR: homepage content/product sections are re-generated in the background
// at most once a minute, so admin edits (which also call revalidatePath("/")
// — see the admin homepage/product API routes) show up immediately, while
// ordinary traffic serves a cached page instead of hitting Prisma every request.
export const revalidate = 60;

export default async function HomePage() {
  const [
    content,
    featuredCategories,
    featuredSubCategories,
    allCategories,
    moonEssentialsCategory,
    newArrivalProducts,
    bestSellerProducts,
    instagramPosts,
  ] = await Promise.all([
    getHomepageContent(),
    getFeaturedCategoriesForHomepage(12),
    getFeaturedSubCategoriesForHomepage(8),
    getCategories(),
    getCategoryBySlug("moon-essentials"),
    getNewArrivals(8),
    getBestSellers(8),
    getVisibleInstagramPosts(8),
  ]);

  // Featured Categories/Moon Essentials are admin-curated (order + visibility
  // picked from the real Category/SubCategory system), but until an admin
  // actually curates them on a fresh install, fall back to the plain
  // category list so these sections keep showing real content instead of
  // vanishing — exactly how they behaved before the curation feature existed.
  function toSubCategoryLinks(category: { slug: string; subCategories: { id: string; name: string; slug: string }[] }) {
    return category.subCategories.map((subCategory) => ({
      id: subCategory.id,
      name: subCategory.name,
      href: `${ROUTES.category(category.slug)}?subCategory=${subCategory.slug}`,
    }));
  }

  const categoriesToShow =
    featuredCategories.length > 0
      ? featuredCategories.map(({ id, category }) => ({
          id,
          category,
          href: undefined as string | undefined,
          subCategoryLinks: toSubCategoryLinks(category),
        }))
      : allCategories.slice(0, 6).map((category) => ({
          id: category.id,
          category,
          href: undefined as string | undefined,
          subCategoryLinks: toSubCategoryLinks(category),
        }));

  const subCategoriesToShow =
    featuredSubCategories.length > 0
      ? featuredSubCategories.map(({ id, subCategory }) => ({
          id,
          subCategory,
          href: `${ROUTES.category(subCategory.category.slug)}?subCategory=${subCategory.slug}`,
        }))
      : (moonEssentialsCategory?.subCategories ?? []).map((subCategory) => ({
          id: subCategory.id,
          subCategory: { ...subCategory, category: moonEssentialsCategory! },
          href: `${ROUTES.category(moonEssentialsCategory!.slug)}?subCategory=${subCategory.slug}`,
        }));

  return (
    <div className="relative">
      {/* One global decorative layer, explicitly z-0, behind the entire
          homepage. Every section below lives in a z-10 content wrapper, so
          the background can never paint on top of cards/text/buttons — see
          HomepageBackground's doc comment for why the old per-section
          approach didn't guarantee that. */}
      <HomepageBackground />

      <div className="relative z-10">
        {content.heroIsVisible && (
          <section className="pt-10 pb-10 sm:pt-14 sm:pb-14">
            <HeroBanner
              image={content.heroImageUrl || heroBannerImage}
              mobileImage={content.heroMobileImageUrl}
              href={content.heroButtonLink || "#explore"}
              alt={content.heroTitle || undefined}
            />
          </section>
        )}

        {content.featuredCategoriesIsVisible && categoriesToShow.length > 0 && (
          <section id="explore" className="py-16 sm:py-20">
            <Container>
              <Reveal>
                <SectionHeading
                  title={content.featuredCategoriesTitle}
                  subtitle={content.featuredCategoriesSubtitle ?? undefined}
                  className="mb-10 sm:mb-12"
                />
              </Reveal>

              {/* flex-wrap + justify-center (not a fixed-column grid) so an
                  incomplete last row of cards centers itself instead of
                  hanging left with large empty tracks on the right — the
                  per-breakpoint widths below reproduce the same 2/3/6-up
                  sizing the old grid used, gap included. */}
              <Reveal stagger className="flex flex-wrap justify-center gap-5 sm:gap-6">
                {categoriesToShow.map(({ id, category, href, subCategoryLinks }) => (
                  <RevealItem
                    key={id}
                    className="w-[calc(50%-0.625rem)] sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(16.666%-1.25rem)]"
                  >
                    <FeaturedCategoryCard
                      name={category.name}
                      slug={category.slug}
                      image={category.image || placeholderImage(category.slug, 600, 750)}
                      href={href}
                      subCategories={subCategoryLinks}
                    />
                  </RevealItem>
                ))}
              </Reveal>
            </Container>
          </section>
        )}

        {content.moonEssentialsIsVisible && subCategoriesToShow.length > 0 && (
          <section className="py-16 sm:py-20">
            <Container>
              <Reveal>
                <SectionHeading
                  title={content.moonEssentialsTitle}
                  subtitle={content.moonEssentialsSubtitle ?? undefined}
                  className="mb-10 sm:mb-12"
                />
              </Reveal>

              <Reveal
                stagger
                className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-4"
              >
                {subCategoriesToShow.map(({ id, subCategory, href }) => (
                  <RevealItem key={id}>
                    <FeaturedCategoryCard
                      name={subCategory.name}
                      slug={subCategory.slug}
                      image={subCategory.image || placeholderImage(subCategory.slug, 600, 750)}
                      href={href}
                    />
                  </RevealItem>
                ))}
              </Reveal>
            </Container>
          </section>
        )}

        {content.newArrivalsIsVisible && (
          <ProductSection
            title={content.newArrivalsTitle}
            subtitle={content.newArrivalsSubtitle ?? undefined}
            products={newArrivalProducts}
            viewAllHref={`${ROUTES.products}?section=new-arrivals`}
            headingClassName={GRADIENT_HEADING_CLASS}
          />
        )}

        {content.promoIsVisible && (
          <PromoBanner
            eyebrow={content.promoEyebrow ?? undefined}
            heading={content.promoHeading || "Up to 30% Off Statement Jewellery"}
            subheading={content.promoSubheading ?? undefined}
            ctaLabel={content.promoButtonText || "Shop the Sale"}
            ctaHref={content.promoButtonLink || ROUTES.products}
            background={content.promoImageUrl || pinkTexture}
            mobileBackground={content.promoMobileImageUrl}
          />
        )}

        {content.bestSellersIsVisible && (
          <ProductSection
            title={content.bestSellersTitle}
            subtitle={content.bestSellersSubtitle ?? undefined}
            products={bestSellerProducts}
            viewAllHref={`${ROUTES.products}?section=best-sellers`}
            background="white"
            headingClassName={GRADIENT_HEADING_CLASS}
          />
        )}

        {content.whyChooseUsIsVisible && (
          <WhyChooseUs features={whyChooseUsFeatures} subtitle={content.whyChooseUsSubtitle ?? undefined} />
        )}

        {content.testimonialsIsVisible && (
          <section className="py-16 sm:py-20">
            <Container>
              <Reveal>
                <SectionHeading
                  title={content.testimonialsTitle}
                  subtitle={content.testimonialsSubtitle ?? undefined}
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
        )}

        {content.followOurStyleIsVisible && (
          <InstagramGallery
            images={instagramPosts.map((post) => post.imageUrl)}
            title={content.followOurStyleTitle}
            instagramUsername={content.instagramUsername ?? undefined}
          />
        )}

        {content.newsletterIsVisible && (
          <NewsletterSection
            heading={content.newsletterHeading}
            subheading={content.newsletterSubheading ?? undefined}
            background={pinkTexture}
          />
        )}
      </div>
    </div>
  );
}
