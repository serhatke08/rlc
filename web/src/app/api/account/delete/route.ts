import { NextResponse } from "next/server";

import {
  authenticateForAccountDeletion,
  consumeDeletionRateLimit,
  deleteAuthenticatedAccount,
  deletionClientIp,
  parseDeletionCredentials,
} from "@/lib/account-delete";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip = deletionClientIp(request);
  if (!consumeDeletionRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait 15 minutes and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const credentials = parseDeletionCredentials(body);
  if (!credentials) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  const result = await authenticateForAccountDeletion(
    credentials.identifier,
    credentials.password,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const deleted = await deleteAuthenticatedAccount(
      result.authClient,
      result.account.userId,
    );
    if (!deleted.ok) {
      return NextResponse.json({ error: deleted.error }, { status: deleted.status });
    }

    try {
      const cookieClient = await createSupabaseServerClient();
      const {
        data: { user },
      } = await cookieClient.auth.getUser();
      if (user?.id === result.account.userId) {
        await cookieClient.auth.signOut();
      }
    } catch {
      // Cookie session cleanup is best-effort after the account is already gone.
    }

    return NextResponse.json({
      success: true,
      message: "İkel account deleted.",
    });
  } finally {
    await result.authClient.auth.signOut().catch(() => {});
  }
}
