import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "../../../server/src/lib/auth";

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://resolvenowai-production.up.railway.app",
  plugins: [inferAdditionalFields<typeof auth>()],
});
