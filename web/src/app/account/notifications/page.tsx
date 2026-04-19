import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AccountNotificationsBackLink,
  AccountNotificationsClient,
  type AccountNotificationRow,
} from "@/components/notifications/account-notifications-client";

export const metadata: Metadata = {
  title: "Bildirimler",
};

export default async function AccountNotificationsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account/notifications");
  }

  const { data, error } = await (supabase.from("notifications") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  let tableMissing = false;
  let initialRows: AccountNotificationRow[] = [];

  if (error) {
    const msg = error.message ?? "";
    if (error.code === "42P01" || msg.includes("does not exist") || msg.includes("relation")) {
      tableMissing = true;
    } else {
      console.error("[account/notifications] query error:", error);
    }
  } else {
    initialRows = (data as AccountNotificationRow[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-8 sm:px-4">
      <AccountNotificationsBackLink />
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Bildirimler</h1>
        <p className="mt-1 text-sm text-zinc-600">Tüm bildirimlerinizi buradan yönetebilirsiniz.</p>
      </div>
      <AccountNotificationsClient initialRows={initialRows} tableMissing={tableMissing} />
    </div>
  );
}
