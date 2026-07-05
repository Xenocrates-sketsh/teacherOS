"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSchools, getClasses } from "@/lib/store";

interface Class {
  id: string;
  name: string;
  created_at: string;
}

export default function SchoolDetailPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const [school, setSchool] = useState<any>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const schools = getSchools();
    const schoolData = schools.find((s) => s.id === schoolId);

    const classesData = getClasses(schoolId)
      .filter((c) => !c.archived)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setSchool(schoolData);
    setClasses(classesData);
    setLoading(false);
  }, [schoolId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading school...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/schools"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Schools
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{school?.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Created {new Date(school?.created_at).toLocaleDateString()}
            </p>
          </div>
          <Link
            href={`/dashboard/schools/${schoolId}/classes/new`}
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
            New Class
          </Link>
        </div>
      </div>

      {/* Classes */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Classes</h2>
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
              Create your first class to get started.
            </p>
            <div className="mt-6">
              <Link
                href={`/dashboard/schools/${schoolId}/classes/new`}
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
                Create Class
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/dashboard/schools/${schoolId}/classes/${cls.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-green-600"
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
                <h3 className="text-lg font-medium text-gray-900">{cls.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Created {new Date(cls.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
