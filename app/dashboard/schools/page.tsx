"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSchools } from "@/lib/store";

interface School {
  id: string;
  name: string;
  created_at: string;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const all = getSchools().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setSchools(all);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#7b6b8d]">Loading schools...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#f8f4ff]">My Schools</h1>
          <p className="mt-1 text-sm text-[#7b6b8d]">
            Manage your schools and classes.
          </p>
        </div>
        <Link
          href="/dashboard/schools/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
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
          New School
        </Link>
      </div>

      {schools.length === 0 ? (
        <div className="bg-surface-card/80 backdrop-blur-xl rounded-lg shadow p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-[#6b5b7d]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-[#f8f4ff]">
            No schools yet
          </h3>
          <p className="mt-1 text-sm text-[#7b6b8d]">
            Get started by creating your first school.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/schools/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
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
              Create School
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <Link
              key={school.id}
              href={`/dashboard/schools/${school.id}`}
              className="bg-surface-card/80 backdrop-blur-xl rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-3">
                <div className="h-12 w-12 rounded-lg bg-[rgba(124,58,237,0.1)] flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-gold-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-[#f8f4ff]">{school.name}</h3>
              <p className="mt-1 text-sm text-[#7b6b8d]">
                Created {new Date(school.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
