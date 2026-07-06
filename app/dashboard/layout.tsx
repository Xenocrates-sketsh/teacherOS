"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, getUsers, logoutUser } from "@/lib/auth";
import {
  Home,
  School,
  Search,
  Archive,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Bell,
} from "lucide-react";
import NotificationBell from "@/app/components/notifications/NotificationBell";
import DarkModeToggle from "@/app/components/ui/DarkModeToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session || session.role !== "teacher") {
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

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: School, label: "My Schools", href: "/dashboard/schools" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: Calendar, label: "Calendar", href: "/dashboard/calendar" },
    { icon: Search, label: "Search", href: "/dashboard/search" },
    { icon: Archive, label: "Archive", href: "/dashboard/archive" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-surface-card/80 backdrop-blur-xl border-r border-[rgba(212,175,55,0.1)] transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-[rgba(212,175,55,0.08)]">
            <Link href="/dashboard" className="flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-gold-400" />
              <span className="text-lg font-bold text-[#f8f4ff]">TW</span>
            </Link>
            <button
              className="lg:hidden text-[#6b5b7d] hover:text-[#9d8ab5]"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#9d8ab5] rounded-lg hover:bg-[rgba(212,175,55,0.08)] hover:text-[#f8f4ff] transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard/notifications"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#9d8ab5] rounded-lg hover:bg-[rgba(212,175,55,0.08)] hover:text-[#f8f4ff] transition-colors"
            >
              <Bell className="w-5 h-5" />
              Notifications
            </Link>
          </nav>

          <div className="border-t border-[rgba(212,175,55,0.08)] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-white text-sm font-medium">
                {user?.full_name?.charAt(0) || "T"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#f8f4ff] truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-[#7b6b8d] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard/settings"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-[#9d8ab5] bg-surface-card rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-red-600 bg-red-500/100/100/100/100/100/100/10 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 bg-surface-card/90 backdrop-blur-xl border-b border-[rgba(212,175,55,0.08)] lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              className="text-[#7b6b8d] hover:text-[#cbd5e1]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-gold-400" />
              <span className="font-semibold text-[#f8f4ff]">
                Teacher Workspace
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DarkModeToggle />
              <NotificationBell />
            </div>
          </div>
        </div>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
