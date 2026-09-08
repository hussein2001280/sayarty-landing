import nodemailer from "nodemailer";

import type { SiteSettings } from "@/lib/types";

export async function sendLeadNotification({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { sent: false, reason: "smtp-not-configured" } as const;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: String(process.env.SMTP_SECURE ?? "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html,
  });

  return { sent: true } as const;
}

export function buildLeadEmail(settings: SiteSettings, payload: Record<string, string>) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>New lead for ${settings.contact.tradingName}</h2>
      <p><strong>Name:</strong> ${payload.fullName}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Selected car:</strong> ${payload.carLabel}</p>
      <p><strong>Preferred contact method:</strong> ${payload.preferredContactMethod}</p>
      <p><strong>Message:</strong> ${payload.message || "No message provided"}</p>
      <hr />
      <p><strong>Source:</strong> ${payload.source}</p>
      <p><strong>Landing page:</strong> ${payload.landingPage}</p>
      <p><strong>Referrer:</strong> ${payload.referrer}</p>
      <p><strong>UTM Source:</strong> ${payload.utmSource}</p>
      <p><strong>UTM Medium:</strong> ${payload.utmMedium}</p>
      <p><strong>UTM Campaign:</strong> ${payload.utmCampaign}</p>
      <p><strong>UTM Term:</strong> ${payload.utmTerm}</p>
      <p><strong>UTM Content:</strong> ${payload.utmContent}</p>
      <p><strong>GCLID:</strong> ${payload.gclid}</p>
      <p><strong>WBRAID:</strong> ${payload.wbraid}</p>
      <p><strong>GBRAID:</strong> ${payload.gbraid}</p>
    </div>
  `;
}
