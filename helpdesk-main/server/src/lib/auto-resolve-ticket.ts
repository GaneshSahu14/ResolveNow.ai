import type { PgBoss } from "pg-boss";
import { generateText } from "ai";
import Sentry from "./sentry";
import prisma from "../db";
import { sendEmailJob } from "./send-email";
import { aiModel } from "./ai-model";

const QUEUE_NAME = "auto-resolve-ticket";


interface AutoResolveJobData {
  ticketId: number;
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
}

export async function registerAutoResolveWorker(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
  });

  await boss.work<AutoResolveJobData>(
    QUEUE_NAME,
    { batchSize: 1, localConcurrency: 1, pollingIntervalSeconds: 5 },
    async (jobs) => {
      const { ticketId, subject, body, senderName, senderEmail } = jobs[0]!.data;
      const firstName = senderName.split(" ")[0];

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "processing" },
        select: { category: true },
      });

      let articles: { title: string; category: string; content: string }[] = [];
      if (updatedTicket?.category) {
        articles = await prisma.knowledgeBaseArticle.findMany({
          where: { category: updatedTicket.category },
          take: 3, // Limit to top 3 articles to stay within Groq TPM limits
        });
      }
      if (articles.length === 0) {
        articles = await prisma.knowledgeBaseArticle.findMany({
          take: 3, // Limit fallback articles to stay within Groq TPM limits
        });
      }

      const knowledgeBaseText = articles
        .map((art) => `Title: ${art.title}\nCategory: ${art.category}\nContent:\n${art.content}`)
        .join("\n\n---\n\n");

      let response: string;
      try {
        const { text } = await generateText({
          model: aiModel,
          system:
            "You are a friendly and professional support agent for ResolveNow. " +
            "Use ONLY the following knowledge base to answer the customer's question.\n\n" +
            knowledgeBaseText +
            "\n\n" +
            "Guidelines for your response:\n" +
            `- Address the customer by their first name: ${firstName}\n` +
            "- Use a warm, professional, and customer-friendly tone\n" +
            "- Format the response clearly with line breaks between paragraphs\n" +
            "- Use bullet points or numbered lists when listing steps or multiple items\n" +
            "- End with an offer to help further, e.g. 'If you have any other questions, feel free to reach out.'\n" +
            "- Sign off with:\n\nBest regards,\nGanesh Sahu\n\n" +
            "If the knowledge base does NOT contain enough information to fully resolve the question, " +
            'respond with exactly "ESCALATE" and nothing else.',
          prompt: `Subject: ${subject}\n\nBody: ${body}`,
        });
        response = text.trim();
      } catch (error) {
        Sentry.captureException(error, {
          tags: { queue: QUEUE_NAME, ticketId },
        });
        console.error(`Auto-resolve AI call failed for ticket ${ticketId}:`, error);
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: "open", assignedToId: null },
        });
        return;
      }

      if (response === "ESCALATE") {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: "open", assignedToId: null },
        });
      } else {
        try {
          await prisma.$transaction([
            prisma.reply.create({
              data: {
                body: response,
                senderType: "agent",
                ticketId,
                userId: null,
              },
            }),
            prisma.ticket.update({
              where: { id: ticketId },
              data: { status: "resolved" },
            }),
          ]);

          let emailBody = response;
          const [custFirstName] = senderName.trim().split(/\s+/);
          if (!emailBody.toLowerCase().startsWith("hi ") && !emailBody.toLowerCase().startsWith("hello ")) {
            emailBody = `Hi ${custFirstName},\n\n` + emailBody;
          }
          if (!emailBody.toLowerCase().includes("best regards") && !emailBody.includes("Ganesh Sahu")) {
            emailBody = emailBody + `\n\nBest regards,\nGanesh Sahu`;
          }


          await sendEmailJob({
            to: senderEmail,
            subject: `Re: ${subject}`,
            body: emailBody,
          });
        } catch (error) {
          Sentry.captureException(error, {
            tags: { queue: QUEUE_NAME, ticketId },
          });
          throw error;
        }
      }
    }
  );
}

export async function sendAutoResolveJob(ticket: {
  id: number;
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
}): Promise<void> {
  const { boss } = await import("./queue");
  await boss.send(QUEUE_NAME, {
    ticketId: ticket.id,
    subject: ticket.subject,
    body: ticket.body,
    senderName: ticket.senderName,
    senderEmail: ticket.senderEmail,
  });
}
