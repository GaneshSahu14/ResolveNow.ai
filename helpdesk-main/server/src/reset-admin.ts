import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { hashPassword } from "better-auth/crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password) {
    throw new Error("SEED_ADMIN_PASSWORD must be set");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(
      `Admin user ${email} not found in DB. Run prisma seed first.`
    );
    return;
  }

  const hashedPassword = await hashPassword(password);

  const account = await prisma.account.findFirst({ where: { userId: user.id } });
  if (account) {
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    });
    console.log(`Successfully updated database password for admin user ${email}!`);
  } else {
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`Created credentials and set password for admin user ${email}!`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

