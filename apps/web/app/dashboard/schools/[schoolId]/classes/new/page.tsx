"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewClassPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    // Create class
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .insert({
        name: name,
        school_id: schoolId,
      })
      .select()
      .single();

    if (classError) {
      setError("Failed to create class");
      setLoading(false);
      return;
    }

    // Generate class code
    const code = generateClassCode();
    const { error: codeError } = await supabase.from("class_codes").insert({
      class_id: classData.id,
      code: code,
    });

    if (codeError) {
      console.error("Failed to generate class code:", codeError);
    }

    router.push(`/dashboard/schools/${schoolId}/classes/${classData.id}`);
  };

  const generateClassCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/schools/${schoolId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to School
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Class</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new class for your school.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Class Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grade 10 - Section A"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              A class code will be generated automatically for students to join.
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href={`/dashboard/schools/${schoolId}`}
              className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
