-- CreateTable
CREATE TABLE "instagram_posts" (
    "id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "public_id" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "instagram_posts_is_visible_display_order_idx" ON "instagram_posts"("is_visible", "display_order");
