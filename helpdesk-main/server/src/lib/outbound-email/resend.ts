import { Resend } from "resend";
import type { SendEmailData } from "./types";

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
  return process.env.RESEND_FROM_EMAIL || "support@resolvenow.ai";
}

/**
 * Sends an email.
 *
 * - If RESEND_API_KEY is configured, sends via Resend.
 * - Otherwise falls back to Ethereal (free test SMTP) and logs a preview URL.
 */
export async function sendEmail(data: SendEmailData): Promise<void> {
  const { to, subject, body, bodyHtml } = data;
  const from = getFromAddress();

  if (process.env.RESEND_API_KEY) {
    // Production: send via Resend
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
  } else {
    // Development: fall back to Ethereal (no API key required)
    const nodemailer = await import("nodemailer");
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

    const info = await transporter.sendMail({ from, to, subject, text: body, ...(bodyHtml && { html: bodyHtml }) });

    console.log(
      `No RESEND_API_KEY — email sent via Ethereal to ${to} — subject: "${subject}"`
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
