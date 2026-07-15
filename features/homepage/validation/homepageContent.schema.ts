import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const optionalUrlOrPath = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""));

export const homepageContentInputSchema = z.object({
  heroImageUrl: optionalText(2000),
  heroImagePublicId: optionalText(300),
  heroMobileImageUrl: optionalText(2000),
  heroMobileImagePublicId: optionalText(300),
  heroTitle: optionalText(150),
  heroSubtitle: optionalText(300),
  heroButtonText: optionalText(50),
  heroButtonLink: optionalUrlOrPath,
  heroIsVisible: z.boolean(),

  announcementText: optionalText(200),
  announcementLink: optionalUrlOrPath,
  announcementIsEnabled: z.boolean(),

  featuredCategoriesTitle: z.string().trim().min(1, "Title is required").max(100),
  featuredCategoriesSubtitle: optionalText(200),
  featuredCategoriesIsVisible: z.boolean(),

  moonEssentialsTitle: z.string().trim().min(1, "Title is required").max(100),
  moonEssentialsSubtitle: optionalText(200),
  moonEssentialsIsVisible: z.boolean(),

  promoEyebrow: optionalText(50),
  promoHeading: optionalText(150),
  promoSubheading: optionalText(300),
  promoButtonText: optionalText(50),
  promoButtonLink: optionalUrlOrPath,
  promoImageUrl: optionalText(2000),
  promoImagePublicId: optionalText(300),
  promoMobileImageUrl: optionalText(2000),
  promoMobileImagePublicId: optionalText(300),
  promoIsVisible: z.boolean(),

  followOurStyleTitle: z.string().trim().min(1, "Title is required").max(100),
  instagramUsername: optionalText(50),
  followOurStyleIsVisible: z.boolean(),

  newArrivalsTitle: z.string().trim().min(1, "Title is required").max(100),
  newArrivalsSubtitle: optionalText(200),
  newArrivalsIsVisible: z.boolean(),

  bestSellersTitle: z.string().trim().min(1, "Title is required").max(100),
  bestSellersSubtitle: optionalText(200),
  bestSellersIsVisible: z.boolean(),

  whyChooseUsSubtitle: optionalText(200),
  whyChooseUsIsVisible: z.boolean(),

  testimonialsTitle: z.string().trim().min(1, "Title is required").max(100),
  testimonialsSubtitle: optionalText(200),
  testimonialsIsVisible: z.boolean(),

  newsletterHeading: z.string().trim().min(1, "Heading is required").max(100),
  newsletterSubheading: optionalText(200),
  newsletterIsVisible: z.boolean(),

  footerText: optionalText(500),
  copyrightText: optionalText(150),
});

export type HomepageContentInput = z.infer<typeof homepageContentInputSchema>;
