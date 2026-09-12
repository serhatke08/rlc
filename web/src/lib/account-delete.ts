import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

const IDENTIFIER_MAX = 320;
const PASSWORD_MAX = 128;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 8;
const INVALID_CREDENTIALS = "Invalid username or password.";
const GOOGLE_ONLY =
  "This ReloopCycle account uses Google sign-in and has no password. Sign in with Google at reloopcycle.co.uk, then delete the account from Account settings.";

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

export type VerifiedDeletionAccount = {
  userId: string;
  username: string;
  displayName: string | null;
  emailMasked: string;
};

type AuthSuccess = {
  ok: true;
  account: VerifiedDeletionAccount;
  authClient: SupabaseClient<Database>;
};

type AuthFailure = {
  ok: false;
  status: number;
  error: string;
};

export type DeletionAuthResult = AuthSuccess | AuthFailure;

type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
};

export function deletionClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function consumeDeletionRateLimit(ip: string): boolean {
  const now = Date.now();
  if (rateBuckets.size > 4000) {
    for (const [key, bucket] of rateBuckets) {
      if (bucket.resetAt <= now) rateBuckets.delete(key);
    }
  }

  const existing = rateBuckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (existing.count >= RATE_LIMIT_MAX) return false;
  existing.count += 1;
  return true;
}

export function parseDeletionCredentials(body: unknown): {
  identifier: string;
  password: string;
} | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (typeof record.identifier !== "string" || typeof record.password !== "string") {
    return null;
  }

  const identifier = record.identifier.trim();
  const password = record.password;
  if (!identifier || !password) return null;
  if (identifier.length > IDENTIFIER_MAX || password.length > PASSWORD_MAX) return null;
  return { identifier, password };
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

function createEphemeralAuthClient(): SupabaseClient<Database> {
  return createClient<Database>(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}

async function delayOnFailure(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400));
}

async function loadProfileByUsername(
  client: SupabaseClient<Database>,
  username: string,
): Promise<ProfileRow | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfileRow;
}

async function loadProfileById(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfileRow;
}

type ResolvedIdentifier =
  | { ok: true; email: string; profile: ProfileRow | null }
  | AuthFailure;

async function resolveEmailForIdentifier(identifier: string): Promise<ResolvedIdentifier> {
  const admin = createSupabaseAdminClient();
  const reader = admin ?? createEphemeralAuthClient();

  if (looksLikeEmail(identifier)) {
    return { ok: true, email: identifier.toLowerCase(), profile: null };
  }

  if (!admin) {
    return {
      ok: false,
      status: 400,
      error: "Use the email address for this ReloopCycle account.",
    };
  }

  const username = identifier.toLowerCase();
  const profile =
    (await loadProfileByUsername(reader, username)) ??
    (username === identifier ? null : await loadProfileByUsername(reader, identifier));
  if (!profile) {
    await delayOnFailure();
    return { ok: false, status: 401, error: INVALID_CREDENTIALS };
  }

  const { data, error } = await admin.auth.admin.getUserById(profile.id);
  const email = data.user?.email;
  if (error || !email) {
    await delayOnFailure();
    return { ok: false, status: 401, error: INVALID_CREDENTIALS };
  }

  return { ok: true, email, profile };
}

async function googleOnlyAccountMessage(userId: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return null;

  const providers = (data.user.identities ?? []).map((identity) => identity.provider);
  const hasGoogle = providers.includes("google");
  const hasPassword = providers.includes("email");
  if (hasGoogle && !hasPassword) return GOOGLE_ONLY;
  return null;
}

export async function authenticateForAccountDeletion(
  identifier: string,
  password: string,
): Promise<DeletionAuthResult> {
  const resolved = await resolveEmailForIdentifier(identifier);
  if (!resolved.ok) return resolved;

  const { email, profile } = resolved;
  const authClient = createEphemeralAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await authClient.auth.signOut().catch(() => {});
    if (profile) {
      const googleMessage = await googleOnlyAccountMessage(profile.id);
      if (googleMessage) {
        return { ok: false, status: 401, error: googleMessage };
      }
    }
    await delayOnFailure();
    return { ok: false, status: 401, error: INVALID_CREDENTIALS };
  }

  const loadedProfile = profile ?? (await loadProfileById(authClient, data.user.id));
  if (!loadedProfile) {
    await authClient.auth.signOut().catch(() => {});
    await delayOnFailure();
    return { ok: false, status: 401, error: INVALID_CREDENTIALS };
  }

  return {
    ok: true,
    authClient,
    account: {
      userId: data.user.id,
      username: loadedProfile.username,
      displayName: loadedProfile.display_name,
      emailMasked: maskEmail(data.user.email ?? email),
    },
  };
}

export async function deleteAuthenticatedAccount(
  authClient: SupabaseClient<Database>,
  userId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const { error: rpcError } = await (authClient.rpc as unknown as (
    fn: "delete_user_account",
  ) => Promise<{ error: { message: string } | null }>)("delete_user_account");

  if (rpcError) {
    console.error("[account-delete] RPC failed:", rpcError.message);
    return {
      ok: false,
      status: 500,
      error: "Failed to delete the ReloopCycle account. Please try again.",
    };
  }

  const admin = createSupabaseAdminClient();
  if (admin) {
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      console.error("[account-delete] Auth user delete failed:", authDeleteError.message);
    }
  }

  return { ok: true };
}
