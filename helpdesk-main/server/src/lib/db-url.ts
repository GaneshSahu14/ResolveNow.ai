const DEFAULT_DB_TIMEOUT_PARAMS: Record<string, string> = {
  connect_timeout: "30",
  statement_timeout: "30000",
  idle_in_transaction_session_timeout: "30000",
};

export function withDbTimeoutDefaults(connectionString: string): string {
  const url = new URL(connectionString);

  for (const [key, value] of Object.entries(DEFAULT_DB_TIMEOUT_PARAMS)) {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export function readPositiveIntEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];
  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
