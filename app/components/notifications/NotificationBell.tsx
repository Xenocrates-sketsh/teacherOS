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
        className="relative p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.is_read ? "bg-primary-50/50" : ""}`}>
                  {n.link ? (
                    <Link href={n.link} onClick={() => { markAsRead(n.id); setShowDropdown(false); }} className="block">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      {n.message && <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                    </Link>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      {n.message && <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <Link
            href="/dashboard/notifications"
            onClick={() => setShowDropdown(false)}
            className="block text-center text-xs text-primary-600 py-2.5 border-t border-gray-100 hover:bg-gray-50 rounded-b-xl"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
