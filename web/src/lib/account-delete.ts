import "server-only";

import { randomBytes } from "node:crypto";
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
  "This İkel account uses Google sign-in and has no password. Sign in with Google at reloopcycle.co.uk, then delete the account from Account settings.";

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
      error: "Use the email address for this İkel account.",
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

type LooseAdmin = {
  from: (table: string) => {
    delete: () => {
      eq: (column: string, value: string) => Promise<{ error: { message: string; code?: string } | null }>;
      or: (filter: string) => Promise<{ error: { message: string; code?: string } | null }>;
    };
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string; code?: string } | null }>;
    };
  };
  storage: {
    listBuckets: () => Promise<{ data: { name: string }[] | null; error: { message: string } | null }>;
    from: (bucket: string) => {
      list: (
        prefix: string,
        options: { limit: number; offset: number },
      ) => Promise<{
        data: Array<{ name: string; id: string | null }> | null;
        error: { message: string } | null;
      }>;
      remove: (paths: string[]) => Promise<{ error: { message: string } | null }>;
    };
  };
  auth: {
    admin: {
      deleteUser: (id: string) => Promise<{ error: { message: string } | null }>;
      updateUserById: (
        id: string,
        attributes: Record<string, unknown>,
      ) => Promise<{ error: { message: string } | null }>;
    };
  };
};

const STORAGE_BUCKETS = [
  "avatars",
  "profil-header",
  "listings-images",
  "banners",
] as const;

async function logIgnore(
  label: string,
  result: PromiseLike<{ error: { message: string; code?: string } | null }>,
): Promise<void> {
  const { error } = await result;
  if (error) {
    console.error(`[account-delete] ${label}:`, error.message);
  }
}

async function listStoragePaths(
  admin: LooseAdmin,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await admin.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset,
    });
    if (error) {
      console.error(`[account-delete] list ${bucket}/${prefix}:`, error.message);
      break;
    }
    if (!data || data.length === 0) break;

    for (const item of data) {
      const child = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        paths.push(...(await listStoragePaths(admin, bucket, child)));
      } else {
        paths.push(child);
      }
    }

    if (data.length < 1000) break;
    offset += data.length;
  }

  return paths;
}

async function deleteUserStorage(admin: LooseAdmin, userId: string): Promise<void> {
  const { data: buckets, error } = await admin.storage.listBuckets();
  const bucketNames = new Set<string>(STORAGE_BUCKETS);
  if (error) {
    console.error("[account-delete] listBuckets:", error.message);
  } else {
    for (const bucket of buckets ?? []) {
      if (bucket.name !== "category-images") bucketNames.add(bucket.name);
    }
  }

  for (const bucket of bucketNames) {
    const prefixed = await listStoragePaths(admin, bucket, userId);
    const root = await listStoragePaths(admin, bucket, "");
    const matches = [
      ...prefixed,
      ...root.filter(
        (path) => path === userId || path.startsWith(`${userId}/`) || path.startsWith(`${userId}-`),
      ),
    ];
    const unique = [...new Set(matches)];
    for (let i = 0; i < unique.length; i += 100) {
      const chunk = unique.slice(i, i + 100);
      const { error: removeError } = await admin.storage.from(bucket).remove(chunk);
      if (removeError) {
        console.error(`[account-delete] remove ${bucket}:`, removeError.message);
      }
    }
  }
}

async function deleteUserRows(admin: LooseAdmin, userId: string): Promise<void> {
  await logIgnore(
    "listing_reports.reviewed_by",
    admin.from("listing_reports").update({ reviewed_by: null }).eq("reviewed_by", userId),
  );
  await logIgnore(
    "listing_reports.reporter_id",
    admin.from("listing_reports").update({ reporter_id: null }).eq("reporter_id", userId),
  );
  await logIgnore(
    "search_history.user_id",
    admin.from("search_history").update({ user_id: null }).eq("user_id", userId),
  );
  await logIgnore(
    "listing_views.user_id",
    admin.from("listing_views").update({ user_id: null }).eq("user_id", userId),
  );

  await logIgnore(
    "ratings",
    admin.from("ratings").delete().or(`rater_id.eq.${userId},rated_id.eq.${userId}`),
  );
  await logIgnore(
    "blocks",
    admin.from("blocks").delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`),
  );
  await logIgnore(
    "reports",
    admin.from("reports").delete().or(`reporter_id.eq.${userId},reported_user_id.eq.${userId}`),
  );
  await logIgnore(
    "verification_requests",
    admin
      .from("verification_requests")
      .delete()
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`),
  );
  await logIgnore(
    "item_transactions",
    admin.from("item_transactions").delete().or(`seller_id.eq.${userId},buyer_id.eq.${userId}`),
  );
  await logIgnore("comments", admin.from("comments").delete().eq("user_id", userId));
  await logIgnore(
    "listing_comments",
    admin.from("listing_comments").delete().eq("user_id", userId),
  );
  await logIgnore(
    "listing_favorites",
    admin.from("listing_favorites").delete().eq("user_id", userId),
  );
  await logIgnore("messages", admin.from("messages").delete().eq("sender_id", userId));
  await logIgnore("messages.receiver", admin.from("messages").delete().eq("receiver_id", userId));
  await logIgnore(
    "conversations",
    admin.from("conversations").delete().or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
  );
  await logIgnore("listings", admin.from("listings").delete().eq("seller_id", userId));
  await logIgnore(
    "user_follows",
    admin.from("user_follows").delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`),
  );
  await logIgnore("notifications", admin.from("notifications").delete().eq("user_id", userId));
  await logIgnore("user_badges", admin.from("user_badges").delete().eq("user_id", userId));
  await logIgnore(
    "user_credit_accounts",
    admin.from("user_credit_accounts").delete().eq("user_id", userId),
  );
  await logIgnore(
    "credit_transactions",
    admin.from("credit_transactions").delete().eq("user_id", userId),
  );
  await logIgnore(
    "user_task_progress",
    admin.from("user_task_progress").delete().eq("user_id", userId),
  );
  await logIgnore(
    "user_badge_progress",
    admin.from("user_badge_progress").delete().eq("user_id", userId),
  );
}

function isBlockedStorageDelete(error: { message: string; code?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "42501" ||
    error.message.includes("Direct deletion from storage tables is not allowed") ||
    error.message.includes("Database error deleting user")
  );
}

async function anonymizeProfile(admin: LooseAdmin, userId: string): Promise<void> {
  const username = `deleted_${userId.replace(/-/g, "").slice(0, 16)}`;
  const { error } = await admin
    .from("profiles")
    .update({
      username,
      display_name: "Deleted account",
      bio: null,
      website: null,
      github: null,
      linkedin: null,
      twitter: null,
      avatar_url: null,
      header_media: null,
    })
    .eq("id", userId);
  if (error) {
    console.error("[account-delete] anonymize profile:", error.message);
  }
}

async function disableAuthUser(admin: LooseAdmin, userId: string): Promise<void> {
  const { error } = await admin.auth.admin.updateUserById(userId, {
    email: `deleted-${userId}@deleted.invalid`,
    password: randomBytes(32).toString("base64url"),
    email_confirm: true,
    ban_duration: "876000h",
    user_metadata: { deleted: true, deleted_at: new Date().toISOString() },
  });
  if (error) {
    console.error("[account-delete] disable auth user:", error.message);
  }
}

export async function deleteAuthenticatedAccount(
  _authClient: SupabaseClient<Database>,
  userId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return {
      ok: false,
      status: 503,
      error: "Account deletion is temporarily unavailable.",
    };
  }

  const admin = adminClient as unknown as LooseAdmin;

  await deleteUserStorage(admin, userId);
  await deleteUserRows(admin, userId);

  const { error: profileError } = await admin.from("profiles").delete().eq("id", userId);
  if (profileError && !isBlockedStorageDelete(profileError)) {
    console.error("[account-delete] profile delete failed:", profileError.message);
    return {
      ok: false,
      status: 500,
      error: "Failed to delete the İkel account. Please try again.",
    };
  }

  if (!profileError) {
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(userId);
    if (!authDeleteError) {
      return { ok: true };
    }
    console.error("[account-delete] Auth user delete failed:", authDeleteError.message);
    if (!isBlockedStorageDelete(authDeleteError)) {
      return {
        ok: false,
        status: 500,
        error: "Failed to delete the İkel account. Please try again.",
      };
    }
  } else {
    console.error(
      "[account-delete] profile delete blocked by storage trigger; disabling account instead",
    );
    await anonymizeProfile(admin, userId);
  }

  await disableAuthUser(admin, userId);
  return { ok: true };
}
