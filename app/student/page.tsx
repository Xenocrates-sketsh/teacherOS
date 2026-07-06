"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getStudentClasses, getClasses } from "@/lib/store";
import {
  BookOpen,
  MessageSquare,
  Calendar,
  CreditCard,
  Settings,
  Plus,
  Clock,
  FileCheck,
} from "lucide-react";

export default function StudentPage() {
  const [user, setUser] = useState<any>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (!session || session.role !== "student") {
      window.location.href = "/login";
      return;
    }

    const enrollments = getStudentClasses(session.id);
    const allClasses = getClasses();
    const enrolled = enrollments
      .map((e) => allClasses.find((c) => c.id === e.class_id))
      .filter((c): c is any => c && !c.archived);

    setUser(session);
    setEnrolledClasses(enrolled);
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
      icon: Plus,
      label: "Join Class",
      href: "/student/join",
      description: "Enter a class code",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/student/messages",
      description: "Chat with teachers",
    },
    {
      icon: Calendar,
      label: "Calendar",
      href: "/student/calendar",
      description: "View your schedule",
    },
    {
      icon: CreditCard,
      label: "My Card",
      href: "/student/card",
      description: "View student ID",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f8f4ff]">
          Welcome back, {user?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-[#7b6b8d] mt-1">Here&apos;s your student overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="glass-card">
        <div className="px-6 py-4 border-b border-[rgba(212,175,55,0.08)]">
          <h2 className="text-lg font-semibold text-[#f8f4ff]">
            My Enrolled Classes
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {enrolledClasses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#7b6b8d] mb-2">No classes yet</p>
              <Link
                href="/student/join"
                className="link-gold text-sm font-medium"
              >
                Join your first class
              </Link>
            </div>
          ) : (
            enrolledClasses.map((cls) => (
              <Link
                key={cls.id}
                href={`/student/classes/${cls.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[rgba(212,175,55,0.05)] transition-colors"
              >
                <div className="w-10 h-10 bg-[rgba(124,58,237,0.1)] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-gold-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#f8f4ff]">{cls.name}</h3>
                  <p className="text-sm text-[#7b6b8d]">Class</p>
                </div>
                <Clock className="w-4 h-4 text-[#6b5b7d]" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
