import { z } from "zod";

export const leadSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required."),
  phone: z.string().trim().min(8, "Phone number is required."),
  email: z.email("Enter a valid email address."),
  message: z.string().trim().max(1000).optional().default(""),
  preferredContactMethod: z.enum(["phone", "email", "whatsapp"]).default("phone"),
  carId: z.string().trim().min(1, "Car is required."),
  landingPage: z.string().trim().default("/"),
  source: z.string().trim().default("website"),
  referrer: z.string().trim().default(""),
  utmSource: z.string().trim().default(""),
  utmMedium: z.string().trim().default(""),
  utmCampaign: z.string().trim().default(""),
  utmTerm: z.string().trim().default(""),
  utmContent: z.string().trim().default(""),
  gclid: z.string().trim().default(""),
  wbraid: z.string().trim().default(""),
  gbraid: z.string().trim().default(""),
  honeypot: z.string().trim().max(0).optional().default(""),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
