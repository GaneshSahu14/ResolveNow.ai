const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

export function getTrustedOrigins(): string[] {
  const fromEnv = process.env.TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production") {
    return fromEnv ?? [];
  }

  return [...new Set([...(fromEnv ?? []), ...DEV_ORIGINS])];
}
