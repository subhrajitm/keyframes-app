const REQUIRED: readonly string[] = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "FAL_API_KEY",
  "OPENROUTER_API_KEY",
];

export function assertServerEnv(): void {
  const missing = REQUIRED.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
