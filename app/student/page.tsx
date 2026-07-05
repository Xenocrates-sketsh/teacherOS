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
        <div className="text-gray-500">Loading...</div>
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
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your student overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            My Enrolled Classes
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {enrolledClasses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No classes yet</p>
              <Link
                href="/student/join"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Join your first class
              </Link>
            </div>
          ) : (
            enrolledClasses.map((cls) => (
              <Link
                key={cls.id}
                href={`/student/classes/${cls.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-500">Class</p>
                </div>
                <Clock className="w-4 h-4 text-gray-400" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
