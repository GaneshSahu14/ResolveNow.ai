import { PgBoss } from "pg-boss";
import Sentry from "./sentry";
import { registerClassifyWorker } from "./classify-ticket";
import { registerAutoResolveWorker } from "./auto-resolve-ticket";
import { registerSendEmailWorker } from "./send-email";
import { readPositiveIntEnv, withDbTimeoutDefaults } from "./db-url";

const boss = new PgBoss({
  connectionString: withDbTimeoutDefaults(process.env.DATABASE_URL!),
  max: readPositiveIntEnv("PG_BOSS_POOL_MAX", 2),
  connectionTimeoutMillis: readPositiveIntEnv("PG_BOSS_CONNECTION_TIMEOUT_MS", 30000),
});

boss.on("error", (error) => {
  Sentry.captureException(error);
  console.error(error);
});

export { boss };

export async function startQueue(): Promise<void> {
  await boss.start();

  await registerClassifyWorker(boss);
  await registerAutoResolveWorker(boss);
  await registerSendEmailWorker(boss);

  console.log("Job queue started");
}

export async function stopQueue(): Promise<void> {
  await boss.stop({ graceful: true, timeout: 30000 });
}
