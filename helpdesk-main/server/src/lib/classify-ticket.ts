import type { PgBoss } from "pg-boss";
import { generateText } from "ai";
import {
  ticketCategories,
  type TicketCategory,
} from "core/constants/ticket-category.ts";
import Sentry from "./sentry";
import prisma from "../db";
import { aiModel } from "./ai-model";
import { sendAutoResolveJob } from "./auto-resolve-ticket";

const QUEUE_NAME = "classify-ticket";

interface ClassifyJobData {
  ticketId: number;
  subject: string;
  body: string;
}

export async function registerClassifyWorker(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
  });

  await boss.work<ClassifyJobData>(
    QUEUE_NAME,
    { batchSize: 1, localConcurrency: 1, pollingIntervalSeconds: 5 },
    async (jobs) => {
      const { ticketId, subject, body } = jobs[0]!.data;

      let category: TicketCategory | null = null;
      try {
        const { text } = await generateText({
          model: aiModel,
          system:
            "You are a support ticket classifier. " +
            "Classify the ticket into exactly one of these categories: " +
            `${ticketCategories.join(", ")}. ` +
            "Return only the category value with no extra text.",
          prompt: `Subject: ${subject}\n\nBody: ${body}`,
        });

        const parsed = text.trim() as TicketCategory;
        if (ticketCategories.includes(parsed)) {
          category = parsed;
        } else {
          console.warn(
            `Invalid category "${text.trim()}" returned for ticket ${ticketId}`
          );
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { queue: QUEUE_NAME, ticketId },
        });
        console.error(`Classification AI call failed for ticket ${ticketId}:`, error);
      }

      try {
        const updatedTicket = await prisma.ticket.update({
          where: { id: ticketId },
          data: category ? { category } : {},
          select: {
            id: true,
            subject: true,
            body: true,
            senderName: true,
            senderEmail: true,
          },
        });

        await sendAutoResolveJob(updatedTicket).catch((error) =>
          console.error(`Failed to enqueue auto-resolve job for ticket ${updatedTicket.id}:`, error)
        );
      } catch (error) {
        Sentry.captureException(error, {
          tags: { queue: QUEUE_NAME, ticketId },
        });
        throw error;
      }
    }
  );
}

export async function sendClassifyJob(ticket: {
  id: number;
  subject: string;
  body: string;
}): Promise<void> {
  const { boss } = await import("./queue");
  await boss.send(QUEUE_NAME, {
    ticketId: ticket.id,
    subject: ticket.subject,
    body: ticket.body,
  });
}
