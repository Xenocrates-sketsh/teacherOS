"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSession, logoutUser } from "@/lib/auth";
import {
  Home,
  Plus,
  MessageSquare,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";
import NotificationBell from "@/app/components/notifications/NotificationBell";
import DarkModeToggle from "@/app/components/ui/DarkModeToggle";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "student") {
      router.push("/login");
      return;
    }
    setUser(session);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#7b6b8d]">Loading...</div>
      </div>
    );
  }

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const bottomNav = [
    { icon: Home, label: "Home", href: "/student" },
    { icon: ClipboardCheck, label: "Attendance", href: "/student/attendance" },
    { icon: Plus, label: "Join", href: "/student/join" },
    { icon: MessageSquare, label: "Chat", href: "/student/messages" },
    { icon: Calendar, label: "Calendar", href: "/student/calendar" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-16 md:pb-0">
      <div className="bg-surface-card/90 backdrop-blur-xl border-b border-[rgba(212,175,55,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/student" className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-gold-400" />
              <span className="text-lg font-bold text-[#f8f4ff]">TW</span>
            </Link>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <NotificationBell />
              <Link
                href="/student/settings"
                className="text-[#6b5b7d] hover:text-[#9d8ab5] transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-[#6b5b7d] hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-white text-sm font-medium">
                {user?.full_name?.charAt(0) || "S"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-surface-card/80 backdrop-blur-xl border-t border-[rgba(212,175,55,0.1)] md:hidden">
        <div className="flex items-center justify-around h-16">
          {bottomNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                isActive(item.href)
                  ? "text-gold-400"
                  : "text-[#7b6b8d] hover:text-gold-400"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
