"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { saveClass, saveClassCode } from "@/lib/store";

export default function NewClassPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const classData = saveClass({
      name: name,
      school_id: schoolId,
      archived: false,
    });

    const code = generateClassCode();
    saveClassCode({
      class_id: classData.id,
      code: code,
      is_active: true,
    });

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
          className="text-sm text-[#7b6b8d] hover:text-[#cbd5e1]"
        >
          ← Back to School
        </Link>
        <h1 className="text-2xl font-bold text-[#f8f4ff] mt-2">Create Class</h1>
        <p className="mt-1 text-sm text-[#7b6b8d]">
          Create a new class for your school.
        </p>
      </div>

      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg">
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#cbd5e1]"
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
              className="mt-1 block w-full border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-[#7b6b8d]">
              A class code will be generated automatically for students to join.
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-500/100/100/100/100/100/100/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href={`/dashboard/schools/${schoolId}`}
              className="flex-1 text-center py-2 px-4 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm text-sm font-medium text-[#cbd5e1] bg-surface-card/80 backdrop-blur-xl hover:bg-[rgba(212,175,55,0.05)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white btn-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
