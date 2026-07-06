"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSession } from "@/lib/auth";
import { getSchools, getClasses, getStudentClasses, getActivities, getTeacherSchools } from "@/lib/store";
import {
  School,
  MessageSquare,
  Calendar,
  Search,
  BookOpen,
  Users,
  Plus,
  Activity,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, gradient, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-surface-card/40 backdrop-blur-xl rounded-2xl p-6 border border-[rgba(212,175,55,0.08)] hover:border-gold-400/20 transition-all duration-500 hover:shadow-xl hover:shadow-gold-500/5"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-400/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-3 shadow-lg`}>
          <Icon className="w-full h-full text-white" />
        </div>
        <div>
          <motion.p
            className="text-3xl font-bold text-[#f8f4ff]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
          <p className="text-sm text-[#7b6b8d] font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function QuickActionCard({ icon: Icon, label, description, href, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link
        href={href}
        className="group block bg-surface-card/40 backdrop-blur-xl rounded-2xl p-6 border border-[rgba(212,175,55,0.08)] hover:border-gold-400/20 transition-all duration-500 hover:shadow-xl hover:shadow-gold-500/5 hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(212,175,55,0.08)] flex items-center justify-center group-hover:bg-[rgba(212,175,55,0.1)] group-hover:border-gold-400/20 transition-all duration-300">
            <Icon className="w-5 h-5 text-[#9d8ab5] group-hover:text-gold-400 transition-colors duration-300" />
          </div>
          <ArrowRight className="w-4 h-4 text-[#6b5b7d] group-hover:text-gold-400 group-hover:translate-x-1 transition-all duration-300" />
        </div>
        <h3 className="font-semibold text-[#f8f4ff] mb-1.5 group-hover:text-gold-400 transition-colors">
          {label}
        </h3>
        <p className="text-sm text-[#7b6b8d] leading-relaxed">{description}</p>
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ schools: 0, classes: 0, students: 0 });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "teacher") {
      window.location.href = "/login";
      return;
    }

    const teacherSchools = getTeacherSchools(session.id);
    const schoolIds = teacherSchools.map((ts) => ts.school_id);
    const allClasses = getClasses().filter((c) => schoolIds.includes(c.school_id) && !c.archived);
    const classIds = allClasses.map((c) => c.id);
    const allStudents = getStudentClasses(undefined).filter((sc) => classIds.includes(sc.class_id));
    const uniqueStudents = new Set(allStudents.map((s) => s.student_id));

    setUser(session);
    setStats({
      schools: new Set(teacherSchools.map((ts) => ts.school_id)).size,
      classes: allClasses.length,
      students: uniqueStudents.size,
    });

    const log = getActivities(session.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    setActivities(log);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const quickActions = [
    {
      icon: School,
      label: "My Schools",
      href: "/dashboard/schools",
      description: "Manage your schools and classes",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/dashboard/messages",
      description: "Chat with students",
    },
    {
      icon: Calendar,
      label: "Calendar",
      href: "/dashboard/calendar",
      description: "View schedule and events",
    },
    {
      icon: Search,
      label: "Search",
      href: "/dashboard/search",
      description: "Find content across all classes",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="flex items-center gap-2 text-gold-400 text-sm font-medium mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Good {new Date().getHours() < 12 ? "morning" : "afternoon"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#f8f4ff]">
            Welcome back, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-[#7b6b8d] mt-1">Here&apos;s your teaching overview</p>
        </div>
        <Link
          href="/dashboard/schools/new"
          className="group inline-flex items-center gap-2 px-5 py-2.5 btn-gold rounded-xl text-sm font-semibold transition-all shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30"
        >
          <Plus className="w-4 h-4" />
          New School
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={School}
          label="Schools"
          value={stats.schools}
          gradient="from-violet-500 to-purple-500"
          delay={0.1}
        />
        <StatCard
          icon={BookOpen}
          label="Classes"
          value={stats.classes}
          gradient="from-gold-500 to-amber-500"
          delay={0.2}
        />
        <StatCard
          icon={Users}
          label="Students"
          value={stats.students}
          gradient="from-emerald-500 to-teal-500"
          delay={0.3}
        />
      </div>

      <div>
        <motion.h2
          className="text-lg font-semibold text-[#f8f4ff] mb-4 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <TrendingUp className="w-5 h-5 text-gold-400" />
          Quick Actions
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <QuickActionCard key={action.label} {...action} delay={0.35 + i * 0.1} />
          ))}
        </div>
      </div>

      {activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold text-[#f8f4ff] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gold-400" />
            Recent Activity
          </h2>
          <div className="bg-surface-card/40 backdrop-blur-xl rounded-2xl border border-[rgba(212,175,55,0.08)] overflow-hidden">
            {activities.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                className="flex items-start gap-4 px-6 py-4 border-b border-[rgba(212,175,55,0.05)] last:border-0 hover:bg-[rgba(212,175,55,0.02)] transition-colors"
              >
                <div className="w-2 h-2 mt-2 rounded-full bg-gold-400 flex-shrink-0 shadow-sm shadow-gold-400/50" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#cbd5e1] capitalize font-medium">
                    {a.action_type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-[#6b5b7d] mt-0.5">
                    {new Date(a.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(a.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
