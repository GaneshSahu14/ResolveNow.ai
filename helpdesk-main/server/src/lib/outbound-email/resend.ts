import { Resend } from "resend";
import type { SendEmailData } from "./types";
import nodemailer from "nodemailer";

let resendClient: Resend | null = null;

/**
 * Returns a configured Resend client instance (singleton).
 */
function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Returns the "from" address for outbound emails.
 */
export function getFromAddress(): string {
  return (
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER ||
    process.env.RESEND_FROM_EMAIL ||
    "support@resolvenow.ai"
  );
}

/**
 * Sends an email.
 *
 * - If SMTP_USER and SMTP_PASS are configured, sends via custom SMTP (Gmail default).
 * - If RESEND_API_KEY is configured, sends via Resend.
 * - Otherwise falls back to Ethereal (free test SMTP) and logs a preview URL.
 */
export async function sendEmail(data: SendEmailData): Promise<void> {
  const { to, subject, body, bodyHtml } = data;
  const from = getFromAddress();

  // 1. Production: send via custom SMTP if configured (e.g. Gmail)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `ResolveNow AI <${from}>`,
        to,
        subject,
        text: body,
        ...(bodyHtml && { html: bodyHtml }),
      });
      console.log(`Email sent via SMTP (${host}:${port}) to ${to} — subject: "${subject}"`);
    } catch (error: any) {
      console.error("SMTP Error:", error);
      throw new Error(`SMTP sending failed: ${error.message}`);
    }
  }
  // 2. Production: send via Resend if configured
  else if (process.env.RESEND_API_KEY) {
    const client = getResendClient();
    const { error } = await client.emails.send({
      from,
      to,
      subject,
      text: body,
      ...(bodyHtml && { html: bodyHtml }),
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`Email sent via Resend to ${to} — subject: "${subject}"`);
  }
  // 3. Development/Local: fall back to Ethereal (no API key required)
  else {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: body,
      ...(bodyHtml && { html: bodyHtml }),
    });

    console.log(
      `No SMTP or Resend credentials — email sent via Ethereal to ${to} — subject: "${subject}"`
    );
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Ethereal preview URL: ${previewUrl}`);
    }
  }
}

/**
 * Resets the cached Resend client. Useful for testing.
 */
export function resetResendClient(): void {
  resendClient = null;
}
