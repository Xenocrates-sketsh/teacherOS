"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Archive, RotateCcw } from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  joined_at: string;
}

export default function ClassSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [archived, setArchived] = useState(false);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get class info
      const { data: classData } = await supabase
        .from("classes")
        .select("name, archived")
        .eq("id", classId)
        .single();

      if (classData) {
        setClassName(classData.name);
        setArchived(classData.archived || false);
      }

      // Get students in this class
      const { data: members } = await supabase
        .from("student_classes")
        .select("student_id, joined_at, users(id, full_name, email), student_profiles(student_id)")
        .eq("class_id", classId);

      if (members) {
        setStudents(
          members.map((m: any) => ({
            id: m.users.id,
            full_name: m.users.full_name,
            email: m.users.email,
            student_id: m.student_profiles?.student_id || "N/A",
            joined_at: m.joined_at,
          }))
        );
      }

      setLoading(false);
    };

    fetchData();
  }, [classId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase
      .from("classes")
      .update({ name: className })
      .eq("id", classId);

    if (error) {
      setMessage({ type: "error", text: "Failed to update class" });
    } else {
      setMessage({ type: "success", text: "Class updated successfully" });
    }

    setSaving(false);
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the class?")) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("student_classes")
      .delete()
      .eq("student_id", studentId)
      .eq("class_id", classId);

    if (error) {
      setMessage({ type: "error", text: "Failed to remove student" });
    } else {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setMessage({ type: "success", text: "Student removed successfully" });
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this class? This action cannot be undone."
      )
    ) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.from("classes").delete().eq("id", classId);

    if (error) {
      setMessage({ type: "error", text: "Failed to delete class" });
    } else {
      router.push(`/dashboard/schools/${schoolId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/schools/${schoolId}/classes/${classId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Class
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Class Settings
        </h1>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Class Name */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Class Information
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="className"
                className="block text-sm font-medium text-gray-700"
              >
                Class Name
              </label>
              <input
                id="className"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Archive */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {archived ? "Archived Class" : "Archive Class"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {archived
              ? "This class is archived. It is hidden from the main dashboard but all content is preserved."
              : "Archiving this class will hide it from the main dashboard. All content is preserved."}
          </p>
          <button
            onClick={async () => {
              setArchiving(true);
              const supabase = createClient();
              await supabase
                .from("classes")
                .update({ archived: !archived })
                .eq("id", classId);
              setArchived(!archived);
              setArchiving(false);
              setMessage({
                type: "success",
                text: archived ? "Class restored successfully" : "Class archived successfully",
              });
            }}
            disabled={archiving}
            className={`inline-flex justify-center items-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              archived
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                : "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
            } disabled:opacity-50`}
          >
            {archived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            {archiving ? "Processing..." : archived ? "Restore Class" : "Archive Class"}
          </button>
        </div>
      </div>

      {/* Students */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Students ({students.length})
          </h3>
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">
              No students enrolled yet. Share the class code to invite students.
            </p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {student.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.email} · ID: {student.student_id}
                    </p>
                    <p className="text-xs text-gray-400">
                      Joined {new Date(student.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(student.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg border border-red-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-red-800 mb-4">Danger Zone</h3>
          <p className="text-sm text-gray-600 mb-4">
            Deleting this class will permanently remove all workspaces, lessons,
            homework, and other content.
          </p>
          <button
            onClick={handleDelete}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Class
          </button>
        </div>
      </div>
    </div>
  );
}
