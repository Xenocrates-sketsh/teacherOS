"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ArchivedClass {
  id: string;
  name: string;
  school_name: string;
  archived_at: string;
}

export default function ArchivePage() {
  const [classes, setClasses] = useState<ArchivedClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchivedClasses = async () => {
      const supabase = createClient();

      // For V1, we'll show classes that could be archived
      // In a real implementation, you'd have an 'archived' field or separate table
      const { data: schools } = await supabase
        .from("schools")
        .select("id, name");

      if (schools && schools.length > 0) {
        const schoolIds = schools.map((s) => s.id);
        const { data: classesData } = await supabase
          .from("classes")
          .select("id, name, created_at, schools(name)")
          .in("school_id", schoolIds)
          .order("created_at", { ascending: false });

        // For now, we'll show all classes as "available for archive"
        // In production, you'd filter by archived status
        setClasses(
          (classesData || []).map((c) => ({
            id: c.id,
            name: c.name,
            school_name: (c.schools as any).name,
            archived_at: c.created_at, // Placeholder
          }))
        );
      }

      setLoading(false);
    };

    fetchArchivedClasses();
  }, []);

  const handleArchive = async (classId: string) => {
    const supabase = createClient();

    // In a real implementation, you'd update an 'archived' field
    // For now, we'll just show a confirmation
    alert("Archive functionality will be implemented in a future update.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading archive...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
        <p className="mt-1 text-sm text-gray-500">
          Archive classes at the end of a semester or school year.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Archive Feature
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Archiving a class will hide it from the main dashboard but
                preserve all content. You can restore archived classes later.
              </p>
            </div>
          </div>
        </div>
      </div>

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
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No classes to archive
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create some classes first, then you can archive them here.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Class Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  School
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((cls) => (
                <tr key={cls.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {cls.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {cls.school_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(cls.archived_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleArchive(cls.id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
