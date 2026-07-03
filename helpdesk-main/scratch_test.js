const { execSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

const serverDir = path.resolve(__dirname, './server');
const envPath = path.resolve(__dirname, './server/.env.test');
const env = dotenv.config({ path: envPath });
const parsedEnv = env.parsed || {};

const execEnv = {
  ...process.env,
  ...parsedEnv,
  NODE_ENV: "test",
  PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "Yes",
  PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "1",
};

// Normalize PATH casing on Windows
const pathKey = Object.keys(process.env).find(k => k.toLowerCase() === "path") || "PATH";
const pathVal = process.env[pathKey];
if (pathVal) {
  execEnv["PATH"] = pathVal;
  execEnv["Path"] = pathVal;
  execEnv["path"] = pathVal;
}

console.log("Running bun prisma/seed.ts manually with execEnv...");
try {
  const out = execSync("bun prisma/seed.ts", {
    cwd: serverDir,
    stdio: "pipe",
    env: execEnv
  });
  console.log("Success! Output:\n", out.toString());
} catch (err) {
  console.error("Failed!");
  console.error("Message:", err.message);
  console.error("Stderr:", err.stderr ? err.stderr.toString() : '');
  console.error("Stdout:", err.stdout ? err.stdout.toString() : '');
}
