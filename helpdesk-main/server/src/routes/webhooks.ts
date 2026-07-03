import { Router } from "express";
import multer from "multer";
import { inboundEmailSchema } from "core/schemas/tickets.ts";
import { requireWebhookSecret } from "../middleware/require-webhook-secret";
import { validate } from "../lib/validate";
import prisma from "../db";
import { sendClassifyJob } from "../lib/classify-ticket";
import { sendAutoResolveJob } from "../lib/auto-resolve-ticket";
import { AI_AGENT_ID } from "core/constants/ai-agent.ts";
import { normalizeInboundEmail } from "../lib/inbound-email/normalize";
import { uploadToCloudinary } from "../lib/cloudinary";


const upload = multer();

function stripSubjectPrefixes(subject: string): string {
  return subject.replace(/^(Re:\s*|Fwd:\s*)+/i, "").trim();
}

function parseFromField(from: string): { email: string; name: string } {
  const match = from.match(/^(.*?)\s*<(.+)>$/);
  if (match) {
    return { name: match[1]!.trim() || match[2]!, email: match[2]! };
  }
  return { name: from, email: from };
}

const router = Router();

router.post("/inbound-email", requireWebhookSecret, upload.any(), async (req, res) => {
  // Normalize incoming payloads (SendGrid-style or CloudMailin)
  const normalized = normalizeInboundEmail(req.body);
  const { email, name } = parseFromField(normalized.from || "");

  const data = validate(inboundEmailSchema, {
    from: email,
    fromName: name,
    subject: normalized.subject || "",
    body: normalized.text || "",
    bodyHtml: normalized.html || undefined,
  }, res);

  if (!data) return;

  const normalizedSubject = stripSubjectPrefixes(data.subject);

  // Check for existing open ticket from same sender with matching subject
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      senderEmail: data.from,
      status: { notIn: ["resolved", "closed"] },
      subject: { equals: normalizedSubject, mode: "insensitive" },
    },
  });

  const attachmentUrls: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    const uploadPromises = req.files.map(async (file: any) => {
      try {
        const url = await uploadToCloudinary(file.buffer, "email-attachments");
        attachmentUrls.push(url);
      } catch (err) {
        console.error(`Failed to upload file ${file.originalname} to Cloudinary:`, err);
      }
    });
    await Promise.all(uploadPromises);
  }

  if (existingTicket) {
    await prisma.reply.create({
      data: {
        body: data.body,
        bodyHtml: data.bodyHtml ?? null,
        senderType: "customer",
        ticketId: existingTicket.id,
        userId: null,
        attachments: attachmentUrls,
      },
    });
    res.status(200).json({ ticket: existingTicket });
    return;
  }

  const ticket = await prisma.ticket.create({
    data: {
      subject: normalizedSubject,
      body: data.body,
      bodyHtml: data.bodyHtml ?? null,
      senderName: data.fromName,
      senderEmail: data.from,
      assignedToId: AI_AGENT_ID,
      attachments: attachmentUrls,
    },
  });

  res.status(201).json({ ticket });

  sendClassifyJob(ticket).catch((error) =>
    console.error(`Failed to enqueue classify job for ticket ${ticket.id}:`, error)
  );

  sendAutoResolveJob(ticket).catch((error) =>
    console.error(`Failed to enqueue auto-resolve job for ticket ${ticket.id}:`, error)
  );
});

export default router;
