"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSession, logoutUser } from "@/lib/auth";
import {
  Home,
  Plus,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";
import NotificationBell from "@/app/components/notifications/NotificationBell";

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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0015]">
        <motion.div
          className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
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
    <div className="min-h-screen bg-[#0a0015] pb-16 md:pb-0">
      <header className="sticky top-0 z-10 bg-surface-card/80 backdrop-blur-xl border-b border-[rgba(212,175,55,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/student" className="flex items-center gap-2.5 group">
              <div className="relative">
                <GraduationCap className="w-6 h-6 text-gold-400" />
                <div className="absolute -inset-1 bg-gold-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent">
                TeacherOS
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link
                href="/student/settings"
                className="p-2 text-[#6b5b7d] hover:text-[#9d8ab5] hover:bg-[rgba(212,175,55,0.08)] rounded-xl transition-all"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-[#6b5b7d] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-gold-500/20">
                {user?.full_name?.charAt(0) || "S"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-surface-card/95 backdrop-blur-xl border-t border-[rgba(212,175,55,0.1)] md:hidden">
        <div className="flex items-center justify-around h-16">
          {bottomNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all relative ${
                  active ? "text-gold-400" : "text-[#7b6b8d] hover:text-gold-400"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="bottomNavActive"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold-400 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
