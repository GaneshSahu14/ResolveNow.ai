import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { validate } from "../lib/validate";
import { parseId } from "../lib/parse-id";
import { generateText } from "ai";
import { aiModel } from "../lib/ai-model";
import { createReplySchema, polishReplySchema } from "core/schemas/replies.ts";
import prisma from "../db";
import { sendEmailJob } from "../lib/send-email";
import fs from "fs";
import path from "path";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const replies = await prisma.reply.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });

  res.json({ replies });
});

router.post("/", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const data = validate(createReplySchema, req.body, res);
  if (!data) return;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const reply = await prisma.reply.create({
    data: {
      body: data.body,
      senderType: "agent",
      ticketId,
      userId: req.user.id,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  const [firstName] = ticket.senderName.trim().split(/\s+/);
  let emailBody = data.body;
  if (!emailBody.toLowerCase().startsWith("hi ") && !emailBody.toLowerCase().startsWith("hello ")) {
    emailBody = `Hi ${firstName},\n\n` + emailBody;
  }
  if (!emailBody.toLowerCase().includes("best regards") && !emailBody.includes("Ganesh Sahu")) {
    emailBody = emailBody + `\n\nBest regards,\nGanesh Sahu`;
  } else if (emailBody.includes("Code with Mosh Support")) {
    emailBody = emailBody.replace(/Code with Mosh Support/g, "Ganesh Sahu");
  }

  sendEmailJob({
    to: ticket.senderEmail,
    subject: `Re: ${ticket.subject}`,
    body: emailBody,
  }).catch((err) => {
    console.error("Failed to send email job:", err);
  });

  res.status(201).json(reply);
});

router.post("/summarize", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const replies = await prisma.reply.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true } } },
  });

  const conversation = replies
    .map((r) => {
      const sender =
        r.senderType === "agent" ? (r.user?.name ?? "Agent") : ticket.senderName;
      return `${sender}: ${r.body}`;
    })
    .join("\n\n");

  const { text } = await generateText({
    model: aiModel,
    system:
      "You are a helpful assistant that summarizes support ticket conversations. " +
      "Provide a clear, concise summary that captures the customer's issue, any actions taken, and the current status. " +
      "Keep the summary to 2-4 sentences. Return only the summary with no preamble.",
    prompt:
      `Subject: ${ticket.subject}\n\n` +
      `Customer message:\n${ticket.body}\n\n` +
      (conversation ? `Conversation:\n${conversation}` : "No replies yet."),
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { aiSummary: text },
  });

  res.json({ summary: text });
});

router.post("/polish", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const data = validate(polishReplySchema, req.body, res);
  if (!data) return;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const agentName = req.user.name;
  const customerName = ticket.senderName.split(" ")[0];

  const { text } = await generateText({
    model: aiModel,
    system:
      "You are a helpful writing assistant for a customer support team. " +
      "Improve the given reply for clarity, professional tone, and grammar. " +
      "Preserve the original meaning and keep the response concise. " +
      "Return only the improved text with no preamble or explanation. " +
      `Address the customer by their name: ${customerName}. ` +
      `End the reply with a sign-off using the agent's name: ${agentName}, and include the link https://codewithmosh.com on its own line after the sign-off.`,
    prompt: data.body,
  });

  res.json({ body: text });
});

router.post("/suggest", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const replies = await prisma.reply.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true } } },
  });

  const conversation = replies
    .map((r) => {
      const sender =
        r.senderType === "agent" ? (r.user?.name ?? "Agent") : ticket.senderName;
      return `${sender}: ${r.body}`;
    })
    .join("\n\n");

  let articles = [];
  if (ticket.category) {
    articles = await prisma.knowledgeBaseArticle.findMany({
      where: { category: ticket.category },
    });
  }
  if (articles.length === 0) {
    articles = await prisma.knowledgeBaseArticle.findMany();
  }

  const knowledgeBaseText = articles
    .map((art) => `Title: ${art.title}\nCategory: ${art.category}\nContent:\n${art.content}`)
    .join("\n\n---\n\n");

  const { text } = await generateText({
    model: aiModel,
    system:
      "You are a helpful and professional customer support assistant for Code with Mosh. " +
      "Generate a suggested reply for the customer based ONLY on the following knowledge base.\n\n" +
      knowledgeBaseText +
      "\n\n" +
      "Guidelines:\n" +
      `- Address the customer by their first name: ${ticket.senderName.split(" ")[0]}\n` +
      "- Keep the tone helpful, warm, and professional\n" +
      "- Format the response clearly with line breaks between paragraphs\n" +
      "- Use bullet points or numbered lists when listing steps or multiple items\n" +
      "- If the knowledge base does not contain enough information, explain that you are looping in a human agent (but still draft a polite response holding message)\n" +
      "- Do not mention that you are an AI assistant unless relevant. Just draft the reply directly.\n" +
      "- Sign off with:\n\nBest regards,\nGanesh Sahu\n\n",
    prompt:
      `Subject: ${ticket.subject}\n\n` +
      `Customer message:\n${ticket.body}\n\n` +
      (conversation ? `Conversation:\n${conversation}` : ""),
  });

  res.json({ suggestion: text });
});

export default router;
