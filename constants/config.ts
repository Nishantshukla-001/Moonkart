/**
 * Central business/config source, mirrored from docs/ClientInfo.md.
 * Update this file whenever ClientInfo.md changes — every part of the
 * app that displays business info (footer, contact page, invoices,
 * emails, SEO schema) should read from here instead of hardcoding values.
 */
export const siteConfig = {
  name: "MoonKart",
  brandName: "MoonKart",
  businessType: "Multi-Vendor E-Commerce Fashion & Lifestyle Marketplace",
  description:
    "MoonKart is a premium multi-vendor fashion and lifestyle marketplace offering a fast, secure, and elegant online shopping experience.",
  url: "https://moonkart.example.com",
} as const;

export const contactInfo = {
  email: "moonkartinfo@gmail.com",
  supportEmail: "moonkartinfo@gmail.com",
  customerCareEmail: "moonkartinfo@gmail.com",
  phone: "+91 9953813719",
  whatsapp: "+91 9953813719",
} as const;

export const businessAddress = {
  line1: "W Z-283/16 A, First Floor",
  line2: "Gali No. 2, Vishnu Garden",
  postOffice: "Tilak Nagar",
  district: "West Delhi",
  city: "Delhi",
  postalCode: "110018",
  country: "India",
  full: "W Z-283/16 A, First Floor, Gali No. 2, Vishnu Garden, Tilak Nagar, West Delhi, Delhi – 110018, India",
} as const;

export const socialLinks = {
  instagram: {
    username: "_moonkart",
    url: "https://instagram.com/_moonkart",
  },
} as const;

export const gstInfo = {
  gstin: "Pending",
} as const;
