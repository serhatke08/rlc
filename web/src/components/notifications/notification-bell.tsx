'use client';

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { NotificationDropdown } from "./notification-dropdown";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let channel: any = null;
    let mounted = true;
    
    // Kullanıcı ID'sini al ve bildirimleri yükle
    const initNotifications = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Error getting session:', sessionError.message);
          if (mounted) {
            setLoading(false);
            setUserId(null);
          }
          return;
        }

        if (!session?.user?.id) {
          if (mounted) {
            setLoading(false);
            setUserId(null);
          }
          return;
        }

        if (mounted) {
          setUserId(session.user.id);
          await loadNotifications(supabase, session.user.id);
          
          // Real-time dinle (sadece tablo varsa)
          try {
            channel = supabase
              .channel('notifications')
              .on(
                'postgres_changes',
                {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'notifications',
                  filter: `user_id=eq.${session.user.id}`,
                },
                () => {
                  if (mounted) {
                    loadNotifications(supabase, session.user.id);
                  }
                }
              )
              .on(
                'postgres_changes',
                {
                  event: 'UPDATE',
                  schema: 'public',
                  table: 'notifications',
                  filter: `user_id=eq.${session.user.id}`,
                },
                () => {
                  if (mounted) {
                    loadNotifications(supabase, session.user.id);
                  }
                }
              )
              .subscribe();
          } catch (err) {
            console.warn('Could not subscribe to notifications:', err);
          }
        }
      } catch (err: any) {
        console.error('Error initializing notifications:', err?.message || err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initNotifications();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadNotifications = async (supabase: any, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        // Tablo yoksa veya hata varsa sadece logla, component'i render etmeye devam et
        // 42P01 = relation does not exist (PostgreSQL error code)
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
          console.warn('Notifications table does not exist yet. Please run the SQL migration: 43_create_notifications_system.sql');
        } else {
          console.warn('Error loading notifications:', error.message);
        }
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter((n: any) => !n.is_read).length || 0);
    } catch (err: any) {
      // Network hatası veya başka bir hata
      if (err?.message?.includes('fetch') || err?.name === 'TypeError') {
        console.warn('Network error loading notifications. Check your Supabase connection.');
      } else {
        console.warn('Error loading notifications:', err?.message || err);
      }
      // Hata durumunda da component render olsun
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  // Her zaman render et - site-header zaten user kontrolü yapıyor
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDropdownOpen(!dropdownOpen);
        }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 transition hover:border-emerald-200"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-zinc-700" />
        {userId && !loading && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {dropdownOpen && (
        <NotificationDropdown
          notifications={notifications}
          onClose={() => setDropdownOpen(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      )}
    </div>
  );
}

