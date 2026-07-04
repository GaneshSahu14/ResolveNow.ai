import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Role } from "core/constants/role.ts";
import prisma from "../db";
import { getTrustedOrigins } from "./trusted-origins";

export const auth = betterAuth({
  basePath: "/api/auth",
  trustedOrigins: getTrustedOrigins(),

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  rateLimit: {
    window: 60,
    max: 1000,
    customRules: {
      "sign-in/email": { window: 60, max: 1000 },
    }
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.agent,
        input: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
});
