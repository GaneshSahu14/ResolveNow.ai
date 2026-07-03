import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { readPositiveIntEnv, withDbTimeoutDefaults } from "./lib/db-url";

const rawConnectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({
  connectionString: withDbTimeoutDefaults(rawConnectionString),
  max: readPositiveIntEnv("PRISMA_POOL_MAX", 3),
});

const prisma = new PrismaClient({ adapter });

export default prisma;
