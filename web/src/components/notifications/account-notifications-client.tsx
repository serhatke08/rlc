"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, CheckCheck } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AccountNotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean | null;
  created_at: string | null;
  read_at: string | null;
};

type Props = {
  initialRows: AccountNotificationRow[];
  tableMissing: boolean;
};

function isUnread(n: AccountNotificationRow) {
  return !n.is_read;
}

export function AccountNotificationsClient({ initialRows, tableMissing }: Props) {
  const [rows, setRows] = useState<AccountNotificationRow[]>(initialRows);
  const [tableMissingState] = useState(tableMissing);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const markAsRead = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    const readAt = new Date().toISOString();
    const { error } = await (supabase.from("notifications") as any)
      .update({ is_read: true, read_at: readAt })
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("[notifications] markAsRead failed:", error.message);
      return;
    }

    setRows((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: readAt } : n)));
  };

  const markAllAsRead = async () => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    const readAt = new Date().toISOString();
    const { error } = await (supabase.from("notifications") as any)
      .update({ is_read: true, read_at: readAt })
      .eq("user_id", session.user.id)
      .or("is_read.eq.false,is_read.is.null");

    if (error) {
      console.error("[notifications] markAllAsRead failed:", error.message);
      return;
    }

    setRows((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: readAt })));
  };

  const unreadCount = rows.filter(isUnread).length;

  if (tableMissingState) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Bildirimler veritabanında henüz yapılandırılmamış. Yönetici olarak{" "}
        <code className="rounded bg-amber-100 px-1">43_create_notifications_system.sql</code>{" "}
        migrasyonunun uygulandığından emin olun.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {rows.length === 0
            ? "Gösterilecek bildirim yok."
            : `${rows.length} bildirim${unreadCount > 0 ? ` · ${unreadCount} okunmamış` : ""}`}
        </p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllAsRead()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-emerald-200 hover:text-emerald-800"
          >
            <CheckCheck className="h-4 w-4" />
            Tümünü okundu yap
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-600">
          Henüz bildiriminiz yok. Mesaj veya ilan güncellemeleri burada görünecek.
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {rows.map((n) => {
            const unread = isUnread(n);
            const created = n.created_at ? new Date(n.created_at) : null;
            const timeLabel =
              created && !Number.isNaN(created.getTime())
                ? formatDistanceToNow(created, { addSuffix: true })
                : "";

            const inner = (
              <div className="flex items-start gap-3 px-4 py-4 transition hover:bg-zinc-50 sm:px-5">
                {unread ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden /> : <span className="mt-2 w-2 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold sm:text-base ${unread ? "text-zinc-900" : "text-zinc-600"}`}>{n.title}</p>
                  <p className="mt-1 text-sm text-zinc-600">{n.message}</p>
                  {timeLabel ? <p className="mt-2 text-xs text-zinc-400">{timeLabel}</p> : null}
                </div>
              </div>
            );

            if (n.link) {
              return (
                <li key={n.id}>
                  <Link
                    href={n.link}
                    className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                    onClick={() => {
                      if (unread) void markAsRead(n.id);
                    }}
                  >
                    {inner}
                  </Link>
                </li>
              );
            }

            return (
              <li key={n.id}>
                <button
                  type="button"
                  className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  onClick={() => {
                    if (unread) void markAsRead(n.id);
                  }}
                >
                  {inner}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function AccountNotificationsBackLink() {
  return (
    <Link
      href="/account"
      className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
    >
      <ArrowLeft className="h-4 w-4" />
      Hesaba dön
    </Link>
  );
}
