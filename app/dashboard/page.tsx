"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getSchools, getClasses, getStudentClasses, getActivities, getTeacherSchools } from "@/lib/store";
import {
  School,
  Search,
  Archive,
  Settings,
  MessageSquare,
  Calendar,
  BookOpen,
  Users,
  Plus,
  Activity,
} from "lucide-react";

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
        <div className="text-[#7b6b8d]">Loading...</div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f8f4ff]">
            Welcome back, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-[#7b6b8d] mt-1">Here&apos;s your teaching overview</p>
        </div>
        <Link
          href="/dashboard/schools/new"
          className="inline-flex items-center gap-2 px-4 py-2 btn-gold transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New School
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-card/80 backdrop-blur-xl rounded-xl p-6 shadow-sm border border-[rgba(212,175,55,0.08)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[rgba(124,58,237,0.1)] rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#f8f4ff]">{stats.schools}</p>
              <p className="text-sm text-[#7b6b8d]">Schools</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-card/80 backdrop-blur-xl rounded-xl p-6 shadow-sm border border-[rgba(212,175,55,0.08)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#f8f4ff]">{stats.classes}</p>
              <p className="text-sm text-[#7b6b8d]">Classes</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-card/80 backdrop-blur-xl rounded-xl p-6 shadow-sm border border-[rgba(212,175,55,0.08)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#f8f4ff]">{stats.students}</p>
              <p className="text-sm text-[#7b6b8d]">Students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-surface-card/80 backdrop-blur-xl rounded-xl p-5 shadow-sm border border-[rgba(212,175,55,0.08)] hover:shadow-md hover:border-gold-400/20 transition-all group"
          >
            <div className="w-10 h-10 bg-surface-card rounded-lg flex items-center justify-center mb-3 group-hover:bg-[rgba(124,58,237,0.1)] transition-colors">
              <action.icon className="w-5 h-5 text-[#9d8ab5] group-hover:text-gold-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-[#f8f4ff] mb-1">{action.label}</h3>
            <p className="text-sm text-[#7b6b8d]">{action.description}</p>
          </Link>
        ))}
      </div>

      {activities.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#f8f4ff] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#6b5b7d]" />
            Recent Activity
          </h2>
          <div className="glass-card divide-y divide-gray-100">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-gold-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#cbd5e1] capitalize">
                    {a.action_type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-[#6b5b7d] mt-0.5">
                    {new Date(a.created_at).toLocaleDateString()} at{" "}
                    {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
