"use client";

import { useState } from "react";
import type { StoreSettings } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CloudinaryUploader, type CloudinaryUploadResult } from "@/components/shared/CloudinaryUploader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { storeSettingsInputSchema, type StoreSettingsInput } from "@/features/admin/validation/storeSettings.schema";

function toDefaults(settings: StoreSettings): StoreSettingsInput {
  return {
    storeName: settings.storeName,
    storeDescription: settings.storeDescription ?? "",
    contactEmail: settings.contactEmail ?? "",
    contactPhone: settings.contactPhone ?? "",
    whatsappNumber: settings.whatsappNumber ?? "",
    instagramUrl: settings.instagramUrl ?? "",
    facebookUrl: settings.facebookUrl ?? "",
    twitterUrl: settings.twitterUrl ?? "",
    logoUrl: settings.logoUrl ?? "",
    logoPublicId: settings.logoPublicId ?? "",
    currencyCode: settings.currencyCode,
    currencySymbol: settings.currencySymbol,
    shippingFlatRate: settings.shippingFlatRate,
    freeShippingThreshold: settings.freeShippingThreshold,
    taxPercent: settings.taxPercent,
  };
}

export function StoreSettingsForm({ settings }: { settings: StoreSettings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StoreSettingsInput>({
    resolver: zodResolver(storeSettingsInputSchema),
    defaultValues: toDefaults(settings),
  });

  function handleLogoUploaded(result: CloudinaryUploadResult) {
    form.setValue("logoUrl", result.url, { shouldDirty: true });
    form.setValue("logoPublicId", result.publicId, { shouldDirty: true });
  }

  async function onSubmit(values: StoreSettingsInput) {
    setIsSubmitting(true);
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await response.json();
    setIsSubmitting(false);

    if (!json.success) {
      toast.error(json.message || "Could not save store settings.");
      return;
    }
    toast.success("Store settings saved.");
    form.reset(toDefaults(json.data));
  }

  const logoUrl = form.watch("logoUrl");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-text-primary">General</h3>
          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="storeDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Description</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-divider pt-5">
          <h3 className="text-sm font-semibold text-text-primary">Branding</h3>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, not registered in next/image remotePatterns
            <img src={logoUrl} alt="Store logo" className="h-14 w-auto rounded-lg border border-border-light object-contain" />
          )}
          <CloudinaryUploader signUrl="/api/admin/cloudinary/sign" onUploaded={handleLogoUploaded} />
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-divider pt-5 sm:grid-cols-2">
          <h3 className="col-span-full text-sm font-semibold text-text-primary">Contact Information</h3>
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whatsappNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp Number</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-divider pt-5 sm:grid-cols-3">
          <h3 className="col-span-full text-sm font-semibold text-text-primary">Social Links</h3>
          <FormField
            control={form.control}
            name="instagramUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="facebookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl>
                  <Input placeholder="https://facebook.com/…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="twitterUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter / X</FormLabel>
                <FormControl>
                  <Input placeholder="https://x.com/…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-divider pt-5 sm:grid-cols-2">
          <h3 className="col-span-full text-sm font-semibold text-text-primary">Currency</h3>
          <FormField
            control={form.control}
            name="currencyCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currencySymbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency Symbol</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-divider pt-5 sm:grid-cols-3">
          <div className="col-span-full">
            <h3 className="text-sm font-semibold text-text-primary">Shipping &amp; Tax</h3>
            <p className="text-xs text-text-muted">
              Placeholder values — not yet wired into checkout calculations.
            </p>
          </div>
          <FormField
            control={form.control}
            name="shippingFlatRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flat Shipping Rate (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value === "" ? null : event.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="freeShippingThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Free Shipping Above (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value === "" ? null : event.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taxPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Percent (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value === "" ? null : event.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-fit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
}
