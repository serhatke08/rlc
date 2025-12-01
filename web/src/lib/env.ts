type EnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY";

const cache = new Map<EnvKey, string>();

export function getEnv(key: EnvKey, options?: { optional?: boolean }) {
  if (cache.has(key)) {
    return cache.get(key) as string;
  }

  const value = process.env[key];
  if (!value && !options?.optional) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Populate it in .env.local (see .env.example).`,
    );
  }

  const normalized = value ?? "";
  cache.set(key, normalized);
  return normalized;
}

export function hasSupabaseCredentials() {
  return Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL?.length ?? 0) > 0 &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ?? 0) > 0,
  );
}

