"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { saveHomework } from "@/lib/store";

export default function NewHomeworkPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const workspaceId = params.workspaceId as string;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
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

    saveHomework({
      title: title,
      description: description,
      due_date: dueDate || null,
      workspace_id: workspaceId,
      created_by: session.id,
    });

    router.push(
      `/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}`
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}`}
          className="text-sm text-[#7b6b8d] hover:text-[#cbd5e1]"
        >
          ← Back to Workspace
        </Link>
        <h1 className="text-2xl font-bold text-[#f8f4ff] mt-2">New Homework</h1>
      </div>

      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg">
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-[#cbd5e1]"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 5 Problems"
              className="mt-1 block w-full border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[#cbd5e1]"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the homework assignment..."
              className="mt-1 block w-full border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-[#cbd5e1]"
            >
              Due Date (Optional)
            </label>
            <input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-500/100/100/100/100/100/100/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}`}
              className="flex-1 text-center py-2 px-4 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm text-sm font-medium text-[#cbd5e1] bg-surface-card/80 backdrop-blur-xl hover:bg-[rgba(212,175,55,0.05)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white btn-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Homework"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
