"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { saveSchool, saveTeacherSchool } from "@/lib/store";

export default function NewSchoolPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const session = getSession();

    if (!session) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const school = saveSchool({
      name: name,
      created_by: session.id,
    });

    saveTeacherSchool({
      teacher_id: session.id,
      school_id: school.id,
      role: "admin",
    });

    router.push(`/dashboard/schools/${school.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/schools"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Schools
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Create School</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new school to organize your classes.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              School Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Lincoln High School"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/dashboard/schools"
              className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create School"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
