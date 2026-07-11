import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  message: z.string().trim().min(1, "Message is required").max(500),
  link: z.string().trim().max(300).optional().or(z.literal("")),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
