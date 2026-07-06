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
    return <div className="flex items-center justify-center h-64"><div className="text-[#7b6b8d]">Loading notifications...</div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f8f4ff]">Notifications</h1>
          <p className="text-sm text-[#7b6b8d] mt-1">{notifications.filter((n) => !n.is_read).length} unread</p>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead}>
          <CheckCheck className="w-4 h-4 mr-1" />
          Mark all read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#f8f4ff] mb-2">No notifications</h3>
          <p className="text-[#7b6b8d]">You'll see notifications here when your teacher posts homework, grades, or announcements.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-surface-card/80 backdrop-blur-xl rounded-xl border p-5 transition-colors ${
                !n.is_read ? "border-gold-400/20 bg-[rgba(124,58,237,0.1)]/30" : "border-[rgba(212,175,55,0.08)]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!n.is_read && <span className="w-2 h-2 bg-gradient-to-br from-gold-500 to-gold-400 rounded-full" />}
                    <h3 className={`text-sm font-medium ${!n.is_read ? "text-[#f8f4ff]" : "text-[#cbd5e1]"}`}>{n.title}</h3>
                  </div>
                  {n.message && <p className="text-sm text-[#7b6b8d] mt-1">{n.message}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-[#6b5b7d]">{new Date(n.created_at).toLocaleDateString()}</span>
                    <span className="text-[10px] uppercase text-[#6b5b7d] bg-surface-card px-1.5 py-0.5 rounded">{n.type.replace("_", " ")}</span>
                  </div>
                </div>
                {n.link && (
                  <Link href={n.link} className="link-gold ml-4">
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
