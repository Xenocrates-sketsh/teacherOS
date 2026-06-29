"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Class {
  id: string;
  name: string;
  school_name: string;
}

interface Homework {
  id: string;
  title: string;
  due_date: string;
  workspace_name: string;
  class_name: string;
}

export default function StudentDashboardPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [upcomingHomework, setUpcomingHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Fetch enrolled classes
      const { data: enrolledClasses } = await supabase
        .from("student_classes")
        .select("class_id, classes(id, name, schools(name))")
        .eq("student_id", user.id);

      if (enrolledClasses) {
        const classList = enrolledClasses.map((ec: any) => ({
          id: ec.classes.id,
          name: ec.classes.name,
          school_name: ec.classes.schools.name,
        }));
        setClasses(classList);

        // Fetch upcoming homework for enrolled classes
        const classIds = classList.map((c) => c.id);
        if (classIds.length > 0) {
          const { data: homework } = await supabase
            .from("homework")
            .select(
              "id, title, due_date, subject_workspaces!inner(name, class_id, classes!inner(name))"
            )
            .in("subject_workspaces.class_id", classIds)
            .gte("due_date", new Date().toISOString())
            .order("due_date", { ascending: true })
            .limit(5);

          if (homework) {
            setUpcomingHomework(
              homework.map((h: any) => ({
                id: h.id,
                title: h.title,
                due_date: h.due_date,
                workspace_name: h.subject_workspaces.name,
                class_name: h.subject_workspaces.classes.name,
              }))
            );
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here are your classes and upcoming assignments.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/student/join"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <svg
                className="h-10 w-10 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Join Class</p>
              <p className="text-xs text-gray-500">Enter a class code</p>
            </div>
          </Link>

          <Link
            href="/student/card"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <svg
                className="h-10 w-10 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">My Card</p>
              <p className="text-xs text-gray-500">View student ID</p>
            </div>
          </Link>

          <Link
            href="/student/settings"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <div className="flex-shrink-0">
              <svg
                className="h-10 w-10 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Settings</p>
              <p className="text-xs text-gray-500">Manage account</p>
            </div>
          </Link>
        </div>
      </div>

      {/* My Classes */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">My Classes</h2>
        {classes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No classes yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Join a class using a class code from your teacher.
            </p>
            <div className="mt-6">
              <Link
                href="/student/join"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Join Class
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/student/classes/${cls.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {cls.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{cls.school_name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Homework */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Upcoming Homework
        </h2>
        {upcomingHomework.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-sm text-gray-500">No upcoming homework.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {upcomingHomework.map((hw) => (
                <li key={hw.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {hw.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {hw.class_name} - {hw.workspace_name}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Due{" "}
                      {new Date(hw.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
