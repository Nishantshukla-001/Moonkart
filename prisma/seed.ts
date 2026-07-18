/**
 * Development seed data for the Phase 4 catalog. Run with `npx prisma db seed`.
 * Safe to re-run — uses upsert on unique slugs.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function image(seed: string, w = 800, h = 800) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

async function main() {
  // Fine Jewellery, Beauty & Skincare, Bags & Accessories, Footwear, and
  // Home & Lifestyle were removed from the live catalog (client doesn't
  // sell these) — dropped from seed data too so re-seeding a fresh database
  // never recreates them. Apparel is untouched.
  const categories = await Promise.all(
    [{ name: "Apparel", slug: "apparel" }].map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        create: { ...c, image: image(`moonkart-cat-${c.slug}`, 600, 450) },
        update: {},
      })
    )
  );
  const [apparel] = categories;

  const subCategories = await Promise.all(
    [
      { name: "Dresses", slug: "dresses", categoryId: apparel.id },
      { name: "Tops", slug: "tops", categoryId: apparel.id },
    ].map((s) =>
      prisma.subCategory.upsert({ where: { slug: s.slug }, create: s, update: {} })
    )
  );
  const [dresses, tops] = subCategories;

  const brands = await Promise.all(
    [
      { name: "MoonKart Signature", slug: "moonkart-signature" },
      { name: "Lumière", slug: "lumiere" },
      { name: "Velora", slug: "velora" },
      { name: "Petal & Co.", slug: "petal-and-co" },
    ].map((b) =>
      prisma.brand.upsert({
        where: { slug: b.slug },
        create: { ...b, logo: image(`moonkart-brand-${b.slug}`, 200, 200) },
        update: {},
      })
    )
  );
  // Only Velora is used below now — the other three brands still seed fine,
  // they just aren't referenced by any remaining (Apparel-only) product.
  const [, , velora] = brands;

  const products = [
    {
      name: "Silk Wrap Blouse",
      slug: "silk-wrap-blouse",
      categoryId: apparel.id,
      subCategoryId: tops.id,
      brandId: velora.id,
      price: 3999,
      salePrice: 3199,
      stock: 30,
      hasVariants: true,
      shortDescription: "Wrap-front blouse in mulberry silk.",
      variants: [
        { size: "S", color: "Ivory", stock: 8 },
        { size: "M", color: "Ivory", stock: 10 },
        { size: "L", color: "Ivory", stock: 6 },
        { size: "M", color: "Blush", stock: 6, isDefault: true },
      ],
    },
    {
      name: "Satin Slip Dress",
      slug: "satin-slip-dress",
      categoryId: apparel.id,
      subCategoryId: dresses.id,
      brandId: velora.id,
      price: 2999,
      stock: 35,
      isFeatured: true,
      hasVariants: true,
      shortDescription: "Bias-cut satin slip dress.",
      variants: [
        { size: "S", color: "Champagne", stock: 5 },
        { size: "M", color: "Champagne", stock: 7, isDefault: true },
        { size: "L", color: "Champagne", stock: 4 },
        { size: "M", color: "Black", stock: 5 },
      ],
    },
  ];

  for (const [index, p] of products.entries()) {
    const { variants, ...productData } = p;
    const seedName = p.slug;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        ...productData,
        thumbnail: image(`moonkart-p-${seedName}`),
        // Stagger createdAt so "New Arrivals" (sorted by createdAt desc) has a
        // meaningful order instead of every seeded row sharing one timestamp.
        createdAt: new Date(Date.now() - index * 1000 * 60 * 60),
      },
      update: {},
    });

    const existingImages = await prisma.productImage.count({ where: { productId: product.id } });
    if (existingImages === 0) {
      await prisma.productImage.createMany({
        data: [0, 1, 2].map((i) => ({
          productId: product.id,
          imageUrl: image(`moonkart-p-${seedName}-${i}`),
          displayOrder: i,
        })),
      });
    }

    if (variants?.length) {
      const existingVariants = await prisma.productVariant.count({ where: { productId: product.id } });
      if (existingVariants === 0) {
        await prisma.productVariant.createMany({
          data: variants.map((v) => ({ ...v, productId: product.id })),
        });
      }
    }
  }

  console.log(
    `Seeded ${categories.length} categories, ${subCategories.length} subcategories, ${brands.length} brands, ${products.length} products.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
