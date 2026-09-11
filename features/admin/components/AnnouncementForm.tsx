"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { announcementSchema, type AnnouncementInput } from "@/features/admin/validation/announcement.schema";

const emptyDefaults: AnnouncementInput = { title: "", message: "", link: "" };

export function AnnouncementForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<AnnouncementInput | null>(null);

  const form = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: emptyDefaults,
  });

  // The actual submit only opens the confirmation step — sending happens in
  // handleConfirmedSend once the admin confirms.
  function handleReviewSubmit(values: AnnouncementInput) {
    setPendingValues(values);
    setConfirmOpen(true);
  }

  async function handleConfirmedSend() {
    if (!pendingValues) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingValues),
      });
      const json = await response.json();

      if (!json.success) {
        toast.error(json.message || "Could not send announcement.");
        return;
      }
      toast.success(json.message);
      form.reset(emptyDefaults);
      setPendingValues(null);
    } catch {
      toast.error("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleReviewSubmit)} className="flex flex-col gap-4">
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

    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      title="Send to all customers?"
      description="Are you sure you want to send this notification to all users? This cannot be undone."
      confirmLabel="Send Notification"
      variant="default"
      onConfirm={handleConfirmedSend}
    />
    </>
  );
}
