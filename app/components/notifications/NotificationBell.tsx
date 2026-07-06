"use client";

import { useEffect, useState, useRef } from "react";
import { getSession } from "@/lib/auth";
import { getNotifications, markNotificationRead } from "@/lib/store";
import { Bell, CheckCheck, X } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
  type: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    const all = getNotifications(session.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    setNotifications(all);
    setUnreadCount(all.filter((n) => !n.is_read).length);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAsRead = (id: string) => {
    markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = () => {
    const session = getSession();
    if (!session) return;
    const unread = notifications.filter((n) => !n.is_read);
    unread.forEach((n) => markNotificationRead(n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-1.5 text-[#6b5b7d] hover:text-[#9d8ab5] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500/100/100/100/100/100/100/100 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-surface-elevated rounded-xl shadow-glass-lg border border-[rgba(212,175,55,0.15)] z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(212,175,55,0.08)]">
            <h3 className="text-sm font-semibold text-[#f8f4ff]">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs link-gold flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#7b6b8d]">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.is_read ? "bg-[rgba(124,58,237,0.1)]" : ""}`}>
                  {n.link ? (
                    <Link href={n.link} onClick={() => { markAsRead(n.id); setShowDropdown(false); }} className="block">
                      <p className="text-sm font-medium text-[#f8f4ff]">{n.title}</p>
                      {n.message && <p className="text-xs text-[#7b6b8d] mt-0.5">{n.message}</p>}
                      <p className="text-[10px] text-[#6b5b7d] mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                    </Link>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-[#f8f4ff]">{n.title}</p>
                      {n.message && <p className="text-xs text-[#7b6b8d] mt-0.5">{n.message}</p>}
                      <p className="text-[10px] text-[#6b5b7d] mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <Link
            href="/dashboard/notifications"
            onClick={() => setShowDropdown(false)}
            className="block text-center text-xs text-gold-400 py-2.5 border-t border-[rgba(212,175,55,0.08)] hover:bg-[rgba(212,175,55,0.05)] rounded-b-xl"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
