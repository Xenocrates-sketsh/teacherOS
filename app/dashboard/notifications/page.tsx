"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { getNotifications, markNotificationRead } from "@/lib/store";
import Link from "next/link";
import { Bell, CheckCheck, ArrowRight } from "lucide-react";
import Button from "@/app/components/ui/Button";

interface Notification {
  id: string;
  title: string;
  message: string | null;
  link: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    const all = getNotifications(session.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setNotifications(all);
    setLoading(false);
  }, []);

  const markAllRead = () => {
    const session = getSession();
    if (!session) return;
    const unread = notifications.filter((n) => !n.is_read);
    unread.forEach((n) => markNotificationRead(n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading notifications...</div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{notifications.filter((n) => !n.is_read).length} unread</p>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead}>
          <CheckCheck className="w-4 h-4 mr-1" />
          Mark all read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500">You'll see notifications here when your teacher posts homework, grades, or announcements.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl border p-5 transition-colors ${
                !n.is_read ? "border-primary-200 bg-primary-50/30" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!n.is_read && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                    <h3 className={`text-sm font-medium ${!n.is_read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</h3>
                  </div>
                  {n.message && <p className="text-sm text-gray-500 mt-1">{n.message}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                    <span className="text-[10px] uppercase text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{n.type.replace("_", " ")}</span>
                  </div>
                </div>
                {n.link && (
                  <Link href={n.link} className="text-primary-600 hover:text-primary-700 ml-4">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
