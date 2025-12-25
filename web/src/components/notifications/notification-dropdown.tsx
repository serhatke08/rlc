'use client';

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationDropdown({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-zinc-200 bg-white shadow-lg z-[100] max-h-96 overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h3 className="font-semibold text-zinc-900">Bildirimler</h3>
        <div className="flex items-center gap-2">
          {notifications.filter((n) => !n.is_read).length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="rounded-lg p-1.5 text-xs text-zinc-600 transition hover:bg-zinc-100"
              title="Tümünü okundu işaretle"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-zinc-500">
            Bildirim yok
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {notifications.map((notification) => {
              return notification.link ? (
                <Link
                  key={notification.id}
                  href={notification.link}
                  onClick={() => handleNotificationClick(notification)}
                  className="block px-4 py-3 transition hover:bg-zinc-50"
                >
                  <div className="flex items-start gap-3">
                    {!notification.is_read && (
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${notification.is_read ? 'text-zinc-600' : 'text-zinc-900'}`}>
                        {notification.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="block px-4 py-3 transition hover:bg-zinc-50 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {!notification.is_read && (
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${notification.is_read ? 'text-zinc-600' : 'text-zinc-900'}`}>
                        {notification.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-zinc-200 px-4 py-2">
          <Link
            href="/account/notifications"
            onClick={onClose}
            className="block text-center text-xs font-semibold text-emerald-600 transition hover:text-emerald-700"
          >
            Tümünü Gör
          </Link>
        </div>
      )}
    </div>
  );
}

