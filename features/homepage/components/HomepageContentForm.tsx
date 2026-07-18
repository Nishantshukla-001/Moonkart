"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CloudinaryUploader, type CloudinaryUploadResult } from "@/components/shared/CloudinaryUploader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminHomepageContentService } from "@/features/admin/services/adminHomepageContent.service";
import {
  homepageContentInputSchema,
  type HomepageContentInput,
} from "@/features/homepage/validation/homepageContent.schema";
import type { IHomepageContent } from "@/types/homepageContent";

function toDefaults(content: IHomepageContent): HomepageContentInput {
  return {
    heroImageUrl: content.heroImageUrl ?? "",
    heroImagePublicId: content.heroImagePublicId ?? "",
    heroMobileImageUrl: content.heroMobileImageUrl ?? "",
    heroMobileImagePublicId: content.heroMobileImagePublicId ?? "",
    heroTitle: content.heroTitle ?? "",
    heroSubtitle: content.heroSubtitle ?? "",
    heroButtonText: content.heroButtonText ?? "",
    heroButtonLink: content.heroButtonLink ?? "",
    heroIsVisible: content.heroIsVisible,

    announcementText: content.announcementText ?? "",
    announcementLink: content.announcementLink ?? "",
    announcementIsEnabled: content.announcementIsEnabled,

    featuredCategoriesTitle: content.featuredCategoriesTitle,
    featuredCategoriesSubtitle: content.featuredCategoriesSubtitle ?? "",
    featuredCategoriesIsVisible: content.featuredCategoriesIsVisible,

    moonEssentialsTitle: content.moonEssentialsTitle,
    moonEssentialsSubtitle: content.moonEssentialsSubtitle ?? "",
    moonEssentialsIsVisible: content.moonEssentialsIsVisible,

    promoEyebrow: content.promoEyebrow ?? "",
    promoHeading: content.promoHeading ?? "",
    promoSubheading: content.promoSubheading ?? "",
    promoButtonText: content.promoButtonText ?? "",
    promoButtonLink: content.promoButtonLink ?? "",
    promoImageUrl: content.promoImageUrl ?? "",
    promoImagePublicId: content.promoImagePublicId ?? "",
    promoMobileImageUrl: content.promoMobileImageUrl ?? "",
    promoMobileImagePublicId: content.promoMobileImagePublicId ?? "",
    promoIsVisible: content.promoIsVisible,

    followOurStyleTitle: content.followOurStyleTitle,
    instagramUsername: content.instagramUsername ?? "",
    followOurStyleIsVisible: content.followOurStyleIsVisible,

    newArrivalsTitle: content.newArrivalsTitle,
    newArrivalsSubtitle: content.newArrivalsSubtitle ?? "",
    newArrivalsIsVisible: content.newArrivalsIsVisible,

    bestSellersTitle: content.bestSellersTitle,
    bestSellersSubtitle: content.bestSellersSubtitle ?? "",
    bestSellersIsVisible: content.bestSellersIsVisible,

    whyChooseUsSubtitle: content.whyChooseUsSubtitle ?? "",
    whyChooseUsIsVisible: content.whyChooseUsIsVisible,

    testimonialsTitle: content.testimonialsTitle,
    testimonialsSubtitle: content.testimonialsSubtitle ?? "",
    testimonialsIsVisible: content.testimonialsIsVisible,

    newsletterHeading: content.newsletterHeading,
    newsletterSubheading: content.newsletterSubheading ?? "",
    newsletterIsVisible: content.newsletterIsVisible,

    footerText: content.footerText ?? "",
    copyrightText: content.copyrightText ?? "",
  };
}

function SectionVisibilityRow({
  id,
  checked,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-light px-3.5 py-3">
      <Label htmlFor={id} className="font-normal text-text-primary">
        Show this section on the homepage
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function HomepageContentForm({ content }: { content: IHomepageContent }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HomepageContentInput>({
    resolver: zodResolver(homepageContentInputSchema),
    defaultValues: toDefaults(content),
  });

  async function onSubmit(values: HomepageContentInput) {
    setIsSubmitting(true);
    const response = await adminHomepageContentService.update(values);
    setIsSubmitting(false);

    if (!response.success || !response.data) {
      toast.error(response.message || "Could not save homepage content.");
      return;
    }
    toast.success("Homepage content saved.");
    form.reset(toDefaults(response.data));
  }

  const heroImageUrl = form.watch("heroImageUrl");
  const heroMobileImageUrl = form.watch("heroMobileImageUrl");
  const promoImageUrl = form.watch("promoImageUrl");
  const promoMobileImageUrl = form.watch("promoMobileImageUrl");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Hero */}
        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-base font-semibold text-text-primary">Hero Section</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Hero Banner Image (desktop)</Label>
              <p className="text-xs text-text-muted">
                Recommended: a wide landscape banner, around 1920×800px.
              </p>
              {heroImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, not registered in next/image remotePatterns
                <img src={heroImageUrl} alt="Hero banner" className="h-24 w-full rounded-lg border border-border-light object-cover" />
              )}
              <CloudinaryUploader
                signUrl="/api/admin/cloudinary/sign"
                onUploaded={(result: CloudinaryUploadResult) => {
                  form.setValue("heroImageUrl", result.url, { shouldDirty: true });
                  form.setValue("heroImagePublicId", result.publicId, { shouldDirty: true });
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Hero Banner Image (mobile)</Label>
              <p className="text-xs text-text-muted">
                Recommended: a separate portrait image, around 1080×1350px (or 1080×1920px) — don&apos;t
                reuse the desktop banner, rearrange the collage vertically instead.
              </p>
              {heroMobileImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, not registered in next/image remotePatterns
                <img src={heroMobileImageUrl} alt="Mobile hero banner" className="h-24 w-full rounded-lg border border-border-light object-cover" />
              )}
              <CloudinaryUploader
                signUrl="/api/admin/cloudinary/sign"
                onUploaded={(result: CloudinaryUploadResult) => {
                  form.setValue("heroMobileImageUrl", result.url, { shouldDirty: true });
                  form.setValue("heroMobileImagePublicId", result.publicId, { shouldDirty: true });
                }}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="heroTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero Title</FormLabel>
                <FormControl>
                  <Input placeholder="Elevate Your Everyday Elegance" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heroSubtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero Subtitle</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="heroButtonText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hero Button Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Shop New Arrivals" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heroButtonLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hero Button Link</FormLabel>
                  <FormControl>
                    <Input placeholder="/products" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="heroIsVisible"
            render={({ field }) => (
              <SectionVisibilityRow id="hero-visible" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* Announcement Bar */}
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="font-heading text-base font-semibold text-text-primary">Announcement Bar</h3>
          <FormField
            control={form.control}
            name="announcementText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Announcement Text</FormLabel>
                <FormControl>
                  <Input placeholder="Free shipping on prepaid orders above ₹999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="announcementLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Announcement Link (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="/products" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="announcementIsEnabled"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border border-border-light px-3.5 py-3">
                <Label htmlFor="announcement-enabled" className="font-normal text-text-primary">
                  Enable announcement bar
                </Label>
                <Switch id="announcement-enabled" checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
        </div>

        {/* Featured Categories */}
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="font-heading text-base font-semibold text-text-primary">Featured Categories</h3>
          <FormField
            control={form.control}
            name="featuredCategoriesTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="featuredCategoriesSubtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Subtitle</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="featuredCategoriesIsVisible"
            render={({ field }) => (
              <SectionVisibilityRow id="featured-categories-visible" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <p className="text-xs text-text-muted">
            Manage which categories appear (and their order) in the card below.
          </p>
        </div>

        {/* Moon Essentials */}
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="font-heading text-base font-semibold text-text-primary">Moon Essentials</h3>
          <FormField
            control={form.control}
            name="moonEssentialsTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="moonEssentialsSubtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Subtitle</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="moonEssentialsIsVisible"
            render={({ field }) => (
              <SectionVisibilityRow id="moon-essentials-visible" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <p className="text-xs text-text-muted">
            Manage which subcategories appear (and their order) in the card below.
          </p>
        </div>

        {/* Promotional Banner */}
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="font-heading text-base font-semibold text-text-primary">Promotional Banner</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Banner Image (desktop)</Label>
              {promoImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, not registered in next/image remotePatterns
                <img src={promoImageUrl} alt="Promo banner" className="h-24 w-full rounded-lg border border-border-light object-cover" />
              )}
              <CloudinaryUploader
                signUrl="/api/admin/cloudinary/sign"
                onUploaded={(result: CloudinaryUploadResult) => {
                  form.setValue("promoImageUrl", result.url, { shouldDirty: true });
                  form.setValue("promoImagePublicId", result.publicId, { shouldDirty: true });
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Banner Image (mobile)</Label>
              {promoMobileImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, not registered in next/image remotePatterns
                <img src={promoMobileImageUrl} alt="Mobile promo banner" className="h-24 w-full rounded-lg border border-border-light object-cover" />
              )}
              <CloudinaryUploader
                signUrl="/api/admin/cloudinary/sign"
                onUploaded={(result: CloudinaryUploadResult) => {
                  form.setValue("promoMobileImageUrl", result.url, { shouldDirty: true });
                  form.setValue("promoMobileImagePublicId", result.publicId, { shouldDirty: true });
                }}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="promoEyebrow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eyebrow</FormLabel>
                <FormControl>
                  <Input placeholder="Limited Time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promoHeading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heading</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promoSubheading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subheading</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="promoButtonText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Text</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="promoButtonLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Link</FormLabel>
                  <FormControl>
                    <Input placeholder="/products" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="promoIsVisible"
            render={({ field }) => (
              <SectionVisibilityRow id="promo-visible" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* New Arrivals */}
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="font-heading text-base font-semibold text-text-primary">New Arrivals</h3>
          <FormField
            control={form.control}
            name="newArrivalsTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newArrivalsSubtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Subtitle</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newArrivalsIsVisible"
            render={({ field }) => (
              <SectionVisibilityRow id="new-arrivals-visible" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* Best Sellers */}
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="font-heading text-base font-semibold text-text-primary">Best Sellers</h3>
          <FormField
            control={form.control}
            name="bestSellersTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bestSellersSubtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Subtitle</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bestSellersIsVisible"
            render={({ field }) => (
              <SectionVisibilityRow id="best-sellers-visible" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* Why Choose Us */}
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="font-heading text-base font-semibold text-text-primary">Why Choose Us</h3>
          <FormField
            control={form.control}
            name="whyChooseUsSubtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Subtitle</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whyChooseUsIsVisible"
            render={({ field }) => (
              <SectionVisibilityRow id="why-choose-us-visible" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* Testimonials */}
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="font-heading text-base font-semibold text-text-primary">Testimonials</h3>
          <FormField
            control={form.control}
            name="testimonialsTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="testimonialsSubtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Subtitle</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="testimonialsIsVisible"
            render={({ field }) => (
              <SectionVisibilityRow id="testimonials-visible" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="font-heading text-base font-semibold text-text-primary">Newsletter</h3>
          <FormField
            control={form.control}
            name="newsletterHeading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heading</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newsletterSubheading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subheading</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newsletterIsVisible"
            render={({ field }) => (
              <SectionVisibilityRow id="newsletter-visible" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="font-heading text-base font-semibold text-text-primary">Footer</h3>
          <FormField
            control={form.control}
            name="footerText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Footer Text</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="copyrightText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Copyright Text</FormLabel>
                <FormControl>
                  <Input placeholder="© 2026 MoonKart. All rights reserved." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-xs text-text-muted">
            WhatsApp number and social links are managed in Settings → Store Settings.
          </p>
        </div>

        <Button type="submit" className="w-fit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Homepage Content"}
        </Button>
      </form>
    </Form>
  );
}
