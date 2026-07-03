import type { NormalizedInboundEmail } from "./types";

/**
 * Normalizes inbound email payloads into a common shape.
 *
 * Supported formats:
 * - SendGrid-style multipart normalized requests (body.from/body.subject/body.text)
 * - CloudMailin "Multipart Normalized" payloads
 */
export function normalizeInboundEmail(body: any): NormalizedInboundEmail {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid inbound email body");
  }

  // If it already has top-level from/subject/text strings,
  // treat as SendGrid-style (or any pre-normalized format).
  if (typeof body.from === "string") {
    return {
      from: body.from,
      subject: typeof body.subject === "string" ? body.subject : undefined,
      text: typeof body.text === "string" ? body.text : undefined,
      html: typeof body.html === "string" ? body.html : undefined,
    };
  }

  // CloudMailin "Multipart Normalized" mapping
  // Prefer headers.from (includes display name, e.g. "Alice <alice@example.com>")
  // over envelope.from (bare email only, e.g. "alice@example.com")
  const fromEmail = typeof body?.headers?.from === "string"
    ? body.headers.from
    : body?.envelope?.from;
  const subject = body?.headers?.subject;
  const html = typeof body?.html === "string" ? body.html : undefined;
  const text =
    (typeof body?.reply_plain === "string" && body.reply_plain.trim().length > 0)
      ? body.reply_plain
      : (typeof body?.plain === "string" ? body.plain : undefined);

  return {
    from: fromEmail,
    subject,
    text,
    html,
  };
}
