"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!profile || profile.role !== "teacher") {
        window.location.href = "/login";
        return;
      }

      const { data: schools } = await supabase
        .from("teacher_schools")
        .select("school_id")
        .eq("teacher_id", authUser.id);

      const { data: classes } = await supabase
        .from("classes")
        .select("id")
        .in(
          "school_id",
          schools?.map((s) => s.school_id) || []
        )
        .eq("archived", false);

      const { data: students } = await supabase
        .from("student_classes")
        .select("student_id")
        .in("class_id", classes?.map((c) => c.id) || []);

      setUser(profile);
      setStats({
        schools: schools?.length || 0,
        classes: classes?.length || 0,
        students: new Set(students?.map((s) => s.student_id) || []).size,
      });

      const { data: log } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setActivities(log || []);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s your teaching overview</p>
        </div>
        <Link
          href="/dashboard/schools/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New School
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.schools}</p>
              <p className="text-sm text-gray-500">Schools</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.classes}</p>
              <p className="text-sm text-gray-500">Classes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
              <p className="text-sm text-gray-500">Students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
              <action.icon className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
            <p className="text-sm text-gray-500">{action.description}</p>
          </Link>
        ))}
      </div>

      {activities.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            Recent Activity
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 capitalize">
                    {a.action_type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
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
