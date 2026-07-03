import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";

async function runWithRetry(command: string, options: any, maxRetries = 3, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      execSync(command, options);
      return;
    } catch (err: any) {
      console.warn(`[global-setup] Command failed (attempt ${attempt}/${maxRetries}): ${command}`);
      if (attempt === maxRetries) {
        throw err;
      }
      console.log(`[global-setup] Waiting ${delayMs}ms before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export default async function globalSetup() {
  const storageDir = path.resolve(__dirname, "./storage");
  // Ensure storage dir exists (in case the user created it manually)
  try {
    const fs = require("fs");
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  } catch {
    // ignore
  }

  const envPath = path.resolve(__dirname, "../server/.env.test");
  const env = dotenv.config({ path: envPath });

  const envFileLoaded = Boolean(env && !env.error);
  const hasParsed = Boolean(env && env.parsed);

  const parsedEnv = (env?.parsed ?? {}) as Record<string, string | undefined>;
  const parsedHasDbUrl = Boolean(parsedEnv.DATABASE_URL);

  console.log(`[global-setup] .env.test loaded: ${envFileLoaded ? "yes" : "no"}`);
  console.log(`[global-setup] env.error exists: ${env && env.error ? "yes" : "no"}`);
  console.log(`[global-setup] env.parsed exists: ${hasParsed ? "yes" : "no"}`);
  console.log(
    `DATABASE_URL loaded: ${parsedHasDbUrl ? "yes" : "no"}`
  );

  console.log("Resetting test database...");

  const serverDir = path.resolve(__dirname, "../server");
  const execEnv: Record<string, string | undefined> = {
    ...process.env,
    ...parsedEnv,
    NODE_ENV: "test",
    PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "Yes",
    PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "1",
  };

  // Normalize PATH casing on Windows to ensure subprocesses resolve system path
  const pathKey = Object.keys(process.env).find((k) => k.toLowerCase() === "path") || "PATH";
  const pathVal = process.env[pathKey];
  if (pathVal) {
    execEnv["PATH"] = pathVal;
    execEnv["Path"] = pathVal;
    execEnv["path"] = pathVal;
  }

  if (!parsedHasDbUrl) {
    const fileMissingOrMissingKey = envFileLoaded ? "missing" : "file-missing";
    throw new Error(
      `Playwright global setup failed:
DATABASE_URL was not loaded from server/.env.test (reason: ${fileMissingOrMissingKey}).
Prisma migrations cannot continue until a valid DATABASE_URL is available.`
    );
  }

  console.log("Wiping database schema via pg...");
  let Client;
  try {
    Client = require("pg").Client;
  } catch {
    Client = require(path.resolve(serverDir, "node_modules/pg")).Client;
  }
  const client = new Client({ connectionString: parsedEnv.DATABASE_URL });
  try {
    await client.connect();
    try {
      await client.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND pid <> pg_backend_pid();
      `);
    } catch (e: any) {
      console.warn(`[global-setup] Could not terminate other sessions: ${e.message}`);
    }
    await client.query("DROP SCHEMA IF EXISTS public CASCADE;");
    await client.query("CREATE SCHEMA public;");
    console.log("[global-setup] Database schema wiped successfully.");
  } finally {
    await client.end();
  }

  console.log("[global-setup] Deploying prisma migrations...");
  // Neon: prisma migrate deploy must use the non-pooled direct URL.
  // Override DATABASE_URL with DIRECT_URL in the subprocess env if available.
  const migrateEnv = parsedEnv.DIRECT_URL
    ? { ...execEnv, DATABASE_URL: parsedEnv.DIRECT_URL }
    : execEnv;
  await runWithRetry('node node_modules/prisma/build/index.js migrate deploy', {
    cwd: serverDir,
    stdio: "inherit",
    env: migrateEnv,
  });

  console.log("Running seed...");

  // Run the seed directly with bun to avoid Go-based esbuild/tsx memory heap crash under Playwright
  await runWithRetry("bun prisma/seed.ts", {
    cwd: serverDir,
    stdio: "inherit",
    env: execEnv,
  });

  console.log("Test database ready.");
}

