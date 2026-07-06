"use client";

import { useLayoutEffect, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getSession, logoutUser } from "@/lib/auth";
import {
  Home,
  School,
  Search,
  Archive,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  X,
  GraduationCap,
  Bell,
  ChevronLeft,
} from "lucide-react";
import NotificationBell from "@/app/components/notifications/NotificationBell";
import SettingsButton from "@/app/components/ui/SettingsButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0015]">
        <motion.div
          className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: School, label: "My Schools", href: "/dashboard/schools" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: Calendar, label: "Calendar", href: "/dashboard/calendar" },
    { icon: Search, label: "Search", href: "/dashboard/search" },
    { icon: Archive, label: "Archive", href: "/dashboard/archive" },
  ];

  const allLinks = [
    ...navItems,
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  ];

  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [gliderStyle, setGliderStyle] = useState({ top: 0, height: 40 });

  const updateGlider = useCallback(() => {
    const idx = allLinks.findIndex((item) => isActive(item.href));
    if (idx >= 0 && linkRefs.current[idx]) {
      const el = linkRefs.current[idx]!;
      setGliderStyle({ top: el.offsetTop, height: el.offsetHeight });
    }
  }, [pathname]);

  useLayoutEffect(() => {
    updateGlider();
  }, [updateGlider]);

  useEffect(() => {
    window.addEventListener("resize", updateGlider);
    return () => window.removeEventListener("resize", updateGlider);
  }, [updateGlider]);

  return (
    <div className="min-h-screen bg-[#0a0015]">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-surface-card/95 backdrop-blur-xl border-r border-[rgba(212,175,55,0.08)] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between h-16 px-4 border-b border-[rgba(212,175,55,0.08)]">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="relative">
                <GraduationCap className="w-7 h-7 text-gold-400" />
                <div className="absolute -inset-1 bg-gold-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent">
                TeacherOS
              </span>
            </Link>
            <button
              className="lg:hidden text-[#6b5b7d] hover:text-[#9d8ab5] transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav
            ref={navRef}
            className="flex-1 min-h-0 overflow-y-auto relative pl-[26px] pr-3 py-4"
          >
            {/* Glider bar */}
            <div className="absolute left-3 top-0 bottom-0 w-[2px] pointer-events-none overflow-visible">
              {/* Track gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(159,61,255,0.2)] to-transparent" style={{ paddingTop: '1rem', paddingBottom: '1rem' }} />
              {/* Gliding indicator */}
              <motion.div
                className="absolute left-0 w-full"
                animate={{ top: gliderStyle.top, height: gliderStyle.height }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 28,
                }}
              >
                <div className="absolute inset-0 bg-[#9f3dff] rounded-full" />
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[300%] h-[60%] bg-[#9f3dff] blur-md" />
                <div className="absolute left-0 top-0 h-full w-[150px] bg-gradient-to-r from-[rgba(159,61,255,0.15)] to-transparent" />
              </motion.div>
            </div>

            {/* Links */}
            <div className="space-y-[3px]">
              {allLinks.map((item, idx) => (
                <div key={item.href}>
                  {idx === navItems.length && (
                    <div className="border-t border-[rgba(212,175,55,0.08)] my-2" />
                  )}
                  <Link
                    ref={(el) => {
                      linkRefs.current[idx] = el;
                    }}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ease-out active:scale-[0.99] ${
                      isActive(item.href)
                        ? "text-[#9f3dff] bg-[rgba(159,61,255,0.08)]"
                        : "text-[#7b6b8d] hover:text-[#b8a5cc]"
                    }`}
                  >
                    <item.icon className="w-5 h-5 transition-all duration-300" />
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>
          </nav>

          <div className="border-t border-[rgba(212,175,55,0.08)] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-gold-500/20">
                {user?.full_name?.charAt(0) || "T"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f8f4ff] truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-[#6b5b7d] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard/settings"
                onClick={() => setSidebarOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[#9d8ab5] bg-[rgba(255,255,255,0.03)] border border-[rgba(212,175,55,0.08)] rounded-xl transition-all duration-300 ease-out hover:bg-[#5353ff] hover:text-white hover:-translate-y-[1px] hover:translate-x-[1px] active:scale-[0.99]"
              >
                <Settings className="w-4 h-4 transition-all duration-300" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl transition-all duration-300 ease-out hover:bg-[#8e2a2a] hover:text-white hover:-translate-y-[1px] hover:translate-x-[1px] active:scale-[0.99]"
              >
                <LogOut className="w-4 h-4 transition-all duration-300" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 bg-surface-card/80 backdrop-blur-xl border-b border-[rgba(212,175,55,0.08)]">
          <div className="flex items-center justify-between h-14 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <SettingsButton
                  onClick={() => setSidebarOpen(true)}
                  open={sidebarOpen}
                />
              </div>
              <div className="hidden lg:flex items-center gap-2 text-[#6b5b7d] text-sm">
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Overview</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
