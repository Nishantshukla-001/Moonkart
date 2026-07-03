import type { ProductBadgeType } from "@/components/products/ProductBadge";
import { placeholderImage } from "@/lib/placeholderImages";

/**
 * Temporary placeholder content (sample categories, products, collections,
 * testimonials). None of this is wired to a database yet.
 *
 * Every `image` field below is just a URL string produced by
 * lib/placeholderImages.ts — the single place placeholder photography is
 * sourced from. When real product photography is available, replace these
 * values (or, once a database exists, the equivalent `thumbnail`/`imageUrl`
 * column per docs/Database.md) with real URLs. No component needs to change:
 * every card/banner/gallery renders images through
 * components/shared/AspectImage.tsx and only ever consumes a URL prop.
 */

export interface PlaceholderProduct {
  name: string;
  slug: string;
  image: string;
  category: string;
  rating: number;
  price: number;
  oldPrice?: number;
  badge?: ProductBadgeType;
}

export interface PlaceholderCategory {
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface PlaceholderCollection {
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface Testimonial {
  name: string;
  quote: string;
  rating: number;
}

export const categories: PlaceholderCategory[] = [
  { name: "Fine Jewellery", slug: "fine-jewellery", image: placeholderImage("moonkart-cat-jewellery", 600, 450), productCount: 128 },
  { name: "Beauty & Skincare", slug: "beauty-skincare", image: placeholderImage("moonkart-cat-beauty", 600, 450), productCount: 96 },
  { name: "Apparel", slug: "apparel", image: placeholderImage("moonkart-cat-apparel", 600, 450), productCount: 214 },
  { name: "Bags & Accessories", slug: "bags-accessories", image: placeholderImage("moonkart-cat-bags", 600, 450), productCount: 87 },
  { name: "Footwear", slug: "footwear", image: placeholderImage("moonkart-cat-footwear", 600, 450), productCount: 64 },
  { name: "Home & Lifestyle", slug: "home-lifestyle", image: placeholderImage("moonkart-cat-home", 600, 450), productCount: 52 },
];

export const trendingProducts: PlaceholderProduct[] = [
  { name: "Pearl Drop Earrings", slug: "pearl-drop-earrings", image: placeholderImage("moonkart-p-pearl-earrings", 600, 600), category: "Fine Jewellery", rating: 4.8, price: 1899, oldPrice: 2499, badge: "trending" },
  { name: "Rose Gold Layered Necklace", slug: "rose-gold-layered-necklace", image: placeholderImage("moonkart-p-rose-necklace", 600, 600), category: "Fine Jewellery", rating: 4.7, price: 2299, badge: "trending" },
  { name: "Silk Wrap Blouse", slug: "silk-wrap-blouse", image: placeholderImage("moonkart-p-silk-blouse", 600, 600), category: "Apparel", rating: 4.6, price: 3199, oldPrice: 3999, badge: "sale" },
  { name: "Matte Velvet Lipstick Duo", slug: "matte-velvet-lipstick-duo", image: placeholderImage("moonkart-p-lipstick-duo", 600, 600), category: "Beauty & Skincare", rating: 4.9, price: 899, badge: "trending" },
];

export const newArrivalProducts: PlaceholderProduct[] = [
  { name: "Crystal Charm Bracelet", slug: "crystal-charm-bracelet", image: placeholderImage("moonkart-p-charm-bracelet", 600, 600), category: "Fine Jewellery", rating: 4.6, price: 1499, badge: "new" },
  { name: "Quilted Chain Sling Bag", slug: "quilted-chain-sling-bag", image: placeholderImage("moonkart-p-sling-bag", 600, 600), category: "Bags & Accessories", rating: 4.7, price: 2799, badge: "new" },
  { name: "Satin Slip Dress", slug: "satin-slip-dress", image: placeholderImage("moonkart-p-slip-dress", 600, 600), category: "Apparel", rating: 4.5, price: 2999, badge: "new" },
  { name: "Hydrating Glow Serum", slug: "hydrating-glow-serum", image: placeholderImage("moonkart-p-glow-serum", 600, 600), category: "Beauty & Skincare", rating: 4.8, price: 1199, badge: "new" },
];

export const bestSellerProducts: PlaceholderProduct[] = [
  { name: "Gold Plated Hoop Earrings", slug: "gold-plated-hoop-earrings", image: placeholderImage("moonkart-p-hoop-earrings", 600, 600), category: "Fine Jewellery", rating: 4.9, price: 1299, badge: "exclusive" },
  { name: "Embroidered Mules", slug: "embroidered-mules", image: placeholderImage("moonkart-p-mules", 600, 600), category: "Footwear", rating: 4.8, price: 2199 },
  { name: "Cashmere Blend Scarf", slug: "cashmere-blend-scarf", image: placeholderImage("moonkart-p-scarf", 600, 600), category: "Bags & Accessories", rating: 4.7, price: 1799 },
  { name: "Rose Petal Candle Set", slug: "rose-petal-candle-set", image: placeholderImage("moonkart-p-candle-set", 600, 600), category: "Home & Lifestyle", rating: 4.9, price: 999, badge: "limited" },
];

export const featuredCollections: PlaceholderCollection[] = [
  { name: "The Bridal Edit", slug: "bridal-edit", image: placeholderImage("moonkart-col-bridal", 800, 1000), description: "Statement jewellery and silhouettes for your big day." },
  { name: "Everyday Gold", slug: "everyday-gold", image: placeholderImage("moonkart-col-gold", 800, 1000), description: "Lightweight pieces made for daily wear." },
  { name: "Summer Pastels", slug: "summer-pastels", image: placeholderImage("moonkart-col-pastels", 800, 1000), description: "Soft hues and breathable fabrics for warm days." },
  { name: "Office Elegance", slug: "office-elegance", image: placeholderImage("moonkart-col-office", 800, 1000), description: "Polished essentials for the modern workday." },
];

export const testimonials: Testimonial[] = [
  {
    name: "Ananya R.",
    quote:
      "MoonKart has become my go-to for gifting myself something special. The jewellery feels far more premium than the price suggests.",
    rating: 5,
  },
  {
    name: "Priya S.",
    quote:
      "Ordered a dress for a wedding and it arrived beautifully packaged, right on time. Genuinely impressed with the whole experience.",
    rating: 5,
  },
  {
    name: "Meera K.",
    quote:
      "Customer support helped me exchange a size within minutes. It's rare to see this level of care from an online store.",
    rating: 4,
  },
  {
    name: "Kavya N.",
    quote:
      "The quality of their skincare picks is unmatched for the price point. I've already reordered three times.",
    rating: 5,
  },
];

export const instagramImages: string[] = [
  placeholderImage("moonkart-ig-1", 400, 400),
  placeholderImage("moonkart-ig-2", 400, 400),
  placeholderImage("moonkart-ig-3", 400, 400),
  placeholderImage("moonkart-ig-4", 400, 400),
  placeholderImage("moonkart-ig-5", 400, 400),
  placeholderImage("moonkart-ig-6", 400, 400),
];
