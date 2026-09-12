import { NextResponse } from "next/server";

import {
  authenticateForAccountDeletion,
  consumeDeletionRateLimit,
  deletionClientIp,
  parseDeletionCredentials,
} from "@/lib/account-delete";

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

  await result.authClient.auth.signOut().catch(() => {});

  return NextResponse.json({
    app: "İkel",
    username: result.account.username,
    displayName: result.account.displayName,
    emailMasked: result.account.emailMasked,
  });
}
