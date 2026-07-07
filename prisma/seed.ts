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
  const categories = await Promise.all(
    [
      { name: "Fine Jewellery", slug: "fine-jewellery" },
      { name: "Beauty & Skincare", slug: "beauty-skincare" },
      { name: "Apparel", slug: "apparel" },
      { name: "Bags & Accessories", slug: "bags-accessories" },
      { name: "Footwear", slug: "footwear" },
      { name: "Home & Lifestyle", slug: "home-lifestyle" },
    ].map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        create: { ...c, image: image(`moonkart-cat-${c.slug}`, 600, 450) },
        update: {},
      })
    )
  );
  const [jewellery, beauty, apparel, bags, footwear, home] = categories;

  const subCategories = await Promise.all(
    [
      { name: "Earrings", slug: "earrings", categoryId: jewellery.id },
      { name: "Necklaces", slug: "necklaces", categoryId: jewellery.id },
      { name: "Skincare", slug: "skincare", categoryId: beauty.id },
      { name: "Makeup", slug: "makeup", categoryId: beauty.id },
      { name: "Dresses", slug: "dresses", categoryId: apparel.id },
      { name: "Tops", slug: "tops", categoryId: apparel.id },
      { name: "Handbags", slug: "handbags", categoryId: bags.id },
      { name: "Heels", slug: "heels", categoryId: footwear.id },
    ].map((s) =>
      prisma.subCategory.upsert({ where: { slug: s.slug }, create: s, update: {} })
    )
  );
  const [earrings, necklaces, skincare, makeup, dresses, tops, handbags, heels] = subCategories;

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
  const [signature, lumiere, velora, petal] = brands;

  const products = [
    {
      name: "Pearl Drop Earrings",
      slug: "pearl-drop-earrings",
      categoryId: jewellery.id,
      subCategoryId: earrings.id,
      brandId: signature.id,
      price: 2499,
      salePrice: 1899,
      stock: 40,
      isFeatured: true,
      isBestSeller: false,
      shortDescription: "Freshwater pearl drops on gold-plated hooks.",
    },
    {
      name: "Rose Gold Layered Necklace",
      slug: "rose-gold-layered-necklace",
      categoryId: jewellery.id,
      subCategoryId: necklaces.id,
      brandId: signature.id,
      price: 2299,
      stock: 25,
      isFeatured: true,
      shortDescription: "Three-layer rose gold chain necklace.",
    },
    {
      name: "Crystal Charm Bracelet",
      slug: "crystal-charm-bracelet",
      categoryId: jewellery.id,
      brandId: lumiere.id,
      price: 1499,
      stock: 60,
      shortDescription: "Delicate charm bracelet with crystal accents.",
    },
    {
      name: "Gold Plated Hoop Earrings",
      slug: "gold-plated-hoop-earrings",
      categoryId: jewellery.id,
      subCategoryId: earrings.id,
      brandId: signature.id,
      price: 1299,
      stock: 80,
      isBestSeller: true,
      shortDescription: "Classic everyday hoops, hypoallergenic.",
    },
    {
      name: "Matte Velvet Lipstick Duo",
      slug: "matte-velvet-lipstick-duo",
      categoryId: beauty.id,
      subCategoryId: makeup.id,
      brandId: petal.id,
      price: 899,
      stock: 100,
      isBestSeller: true,
      shortDescription: "Two long-wear matte shades in one set.",
    },
    {
      name: "Hydrating Glow Serum",
      slug: "hydrating-glow-serum",
      categoryId: beauty.id,
      subCategoryId: skincare.id,
      brandId: petal.id,
      price: 1199,
      stock: 70,
      isFeatured: true,
      shortDescription: "Vitamin C serum for a natural glow.",
    },
    {
      name: "Rose Petal Candle Set",
      slug: "rose-petal-candle-set",
      categoryId: home.id,
      price: 999,
      stock: 45,
      isBestSeller: true,
      shortDescription: "Set of 3 soy candles, rose petal scent.",
    },
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
    {
      name: "Quilted Chain Sling Bag",
      slug: "quilted-chain-sling-bag",
      categoryId: bags.id,
      subCategoryId: handbags.id,
      brandId: lumiere.id,
      price: 2799,
      stock: 22,
      isFeatured: true,
      shortDescription: "Quilted sling bag with gold chain strap.",
    },
    {
      name: "Cashmere Blend Scarf",
      slug: "cashmere-blend-scarf",
      categoryId: bags.id,
      brandId: velora.id,
      price: 1799,
      stock: 50,
      shortDescription: "Soft cashmere-blend scarf, four colourways.",
      hasVariants: true,
      variants: [
        { color: "Camel", stock: 15, isDefault: true },
        { color: "Charcoal", stock: 15 },
        { color: "Blush", stock: 10 },
        { color: "Ivory", stock: 10 },
      ],
    },
    {
      name: "Embroidered Mules",
      slug: "embroidered-mules",
      categoryId: footwear.id,
      subCategoryId: heels.id,
      brandId: signature.id,
      price: 2199,
      stock: 28,
      hasVariants: true,
      shortDescription: "Hand-embroidered block-heel mules.",
      variants: [
        { size: "6", stock: 5 },
        { size: "7", stock: 8, isDefault: true },
        { size: "8", stock: 8 },
        { size: "9", stock: 7 },
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
