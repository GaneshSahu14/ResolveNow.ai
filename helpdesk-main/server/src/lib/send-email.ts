import type { PgBoss } from "pg-boss";
import Sentry from "./sentry";
import { sendEmail } from "./outbound-email/resend";
import type { SendEmailData } from "./outbound-email/types";

const QUEUE_NAME = "send-email";

export async function registerSendEmailWorker(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
  });

  await boss.work<SendEmailData>(
    QUEUE_NAME,
    { batchSize: 1, localConcurrency: 1, pollingIntervalSeconds: 5 },
    async (jobs) => {
      try {
        await sendEmail(jobs[0]!.data);
      } catch (error) {
        Sentry.captureException(error, {
          tags: { queue: QUEUE_NAME },
        });
        throw error;
      }
    }
  );
}

export async function sendEmailJob(data: SendEmailData): Promise<void> {
  const { boss } = await import("./queue");
  await boss.send(QUEUE_NAME, data);
}
