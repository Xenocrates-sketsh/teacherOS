"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getClasses, getWorkspaces } from "@/lib/store";

interface Workspace {
  id: string;
  name: string;
  subject: string;
}

export default function StudentClassPage() {
  const params = useParams();
  const classId = params.classId as string;
  const [classData, setClassData] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const classes = getClasses();
    const classInfo = classes.find((c) => c.id === classId);

    const workspaceData = getWorkspaces(classId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    setClassData(classInfo);
    setWorkspaces(workspaceData);
    setLoading(false);
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading class...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/student"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {classData?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Class
        </p>
      </div>

      {/* Workspaces */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Subject Workspaces
        </h2>
        {workspaces.length === 0 ? (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No workspaces yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your teacher hasn&apos;t created any workspaces yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/student/classes/${classId}/workspaces/${workspace.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-primary-600"
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
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {workspace.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {workspace.subject}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
