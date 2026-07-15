-- CreateTable
CREATE TABLE "homepage_content" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "hero_image_url" TEXT,
    "hero_image_public_id" TEXT,
    "hero_mobile_image_url" TEXT,
    "hero_mobile_image_public_id" TEXT,
    "hero_title" TEXT,
    "hero_subtitle" TEXT,
    "hero_button_text" TEXT,
    "hero_button_link" TEXT,
    "hero_is_visible" BOOLEAN NOT NULL DEFAULT true,
    "announcement_text" TEXT,
    "announcement_link" TEXT,
    "announcement_is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "featured_categories_title" TEXT NOT NULL DEFAULT 'Featured Categories',
    "featured_categories_subtitle" TEXT,
    "featured_categories_is_visible" BOOLEAN NOT NULL DEFAULT true,
    "moon_essentials_title" TEXT NOT NULL DEFAULT 'Moon Essentials',
    "moon_essentials_subtitle" TEXT,
    "moon_essentials_is_visible" BOOLEAN NOT NULL DEFAULT true,
    "promo_eyebrow" TEXT,
    "promo_heading" TEXT,
    "promo_subheading" TEXT,
    "promo_button_text" TEXT,
    "promo_button_link" TEXT,
    "promo_image_url" TEXT,
    "promo_image_public_id" TEXT,
    "promo_mobile_image_url" TEXT,
    "promo_mobile_image_public_id" TEXT,
    "promo_is_visible" BOOLEAN NOT NULL DEFAULT true,
    "follow_our_style_title" TEXT NOT NULL DEFAULT 'Follow Our Style',
    "instagram_username" TEXT,
    "follow_our_style_is_visible" BOOLEAN NOT NULL DEFAULT true,
    "new_arrivals_title" TEXT NOT NULL DEFAULT 'New Arrivals',
    "new_arrivals_subtitle" TEXT,
    "new_arrivals_is_visible" BOOLEAN NOT NULL DEFAULT true,
    "best_sellers_title" TEXT NOT NULL DEFAULT 'Best Sellers',
    "best_sellers_subtitle" TEXT,
    "best_sellers_is_visible" BOOLEAN NOT NULL DEFAULT true,
    "why_choose_us_subtitle" TEXT,
    "why_choose_us_is_visible" BOOLEAN NOT NULL DEFAULT true,
    "testimonials_title" TEXT NOT NULL DEFAULT 'Loved by Our Customers',
    "testimonials_subtitle" TEXT,
    "testimonials_is_visible" BOOLEAN NOT NULL DEFAULT true,
    "newsletter_heading" TEXT NOT NULL DEFAULT 'Join the MoonKart Circle',
    "newsletter_subheading" TEXT,
    "newsletter_is_visible" BOOLEAN NOT NULL DEFAULT true,
    "footer_text" TEXT,
    "copyright_text" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_categories" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_subcategories" (
    "id" UUID NOT NULL,
    "sub_category_id" UUID NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "featured_categories_category_id_key" ON "featured_categories"("category_id");

-- CreateIndex
CREATE INDEX "featured_categories_is_visible_display_order_idx" ON "featured_categories"("is_visible", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "featured_subcategories_sub_category_id_key" ON "featured_subcategories"("sub_category_id");

-- CreateIndex
CREATE INDEX "featured_subcategories_is_visible_display_order_idx" ON "featured_subcategories"("is_visible", "display_order");

-- AddForeignKey
ALTER TABLE "featured_categories" ADD CONSTRAINT "featured_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_subcategories" ADD CONSTRAINT "featured_subcategories_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
