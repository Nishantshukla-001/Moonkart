"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { announcementSchema, type AnnouncementInput } from "@/features/admin/validation/announcement.schema";

const emptyDefaults: AnnouncementInput = { title: "", message: "", link: "" };

export function AnnouncementForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: emptyDefaults,
  });

  async function onSubmit(values: AnnouncementInput) {
    setIsSubmitting(true);
    const response = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await response.json();
    setIsSubmitting(false);

    if (!json.success) {
      toast.error(json.message || "Could not send announcement.");
      return;
    }
    toast.success(json.message);
    form.reset(emptyDefaults);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Diwali Sale is Live!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Tell your customers what's new..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link (optional)</FormLabel>
              <FormControl>
                <Input placeholder="/products" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-fit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send to All Customers"}
        </Button>
      </form>
    </Form>
  );
}
