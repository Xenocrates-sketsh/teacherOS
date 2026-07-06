"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getClasses, updateClass, deleteClass, getStudentClasses, getUsers } from "@/lib/auth";
import { getClasses as getStoreClasses } from "@/lib/store";
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
    const classes = getStoreClasses();
    const classData = classes.find((c) => c.id === classId);
    if (classData) {
      setClassName(classData.name);
      setArchived(classData.archived || false);
    }

    const enrollments = getStudentClasses(undefined, classId);
    const allUsers = getUsers();
    const studentList = enrollments.map((e) => {
      const u = allUsers.find((user) => user.id === e.student_id);
      return {
        id: e.student_id,
        full_name: u?.full_name || "Unknown",
        email: u?.email || "",
        student_id: e.student_id,
        joined_at: e.joined_at,
      };
    });
    setStudents(studentList);
    setLoading(false);
  }, [classId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    updateClass(classId, { name: className });
    setMessage({ type: "success", text: "Class updated successfully" });
    setSaving(false);
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the class?")) return;

    const enrollments = getStudentClasses();
    const filtered = enrollments.filter((e) => !(e.student_id === studentId && e.class_id === classId));
    const STORE_PREFIX = "tw_";
    localStorage.setItem(STORE_PREFIX + "student_classes", JSON.stringify(filtered));

    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setMessage({ type: "success", text: "Student removed successfully" });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) return;

    deleteClass(classId);
    router.push(`/dashboard/schools/${schoolId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#7b6b8d]">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/schools/${schoolId}/classes/${classId}`}
          className="text-sm text-[#7b6b8d] hover:text-[#cbd5e1]"
        >
          ← Back to Class
        </Link>
        <h1 className="text-2xl font-bold text-[#f8f4ff] mt-2">
          Class Settings
        </h1>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-500/100/100/100/100/100/100/100/10 text-green-400"
              : "bg-red-500/100/100/100/100/100/100/10 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Class Name */}
      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-[#f8f4ff] mb-4">
            Class Information
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="className"
                className="block text-sm font-medium text-[#cbd5e1]"
              >
                Class Name
              </label>
              <input
                id="className"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="mt-1 block w-full border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Archive */}
      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-[#f8f4ff] mb-4">
            {archived ? "Archived Class" : "Archive Class"}
          </h3>
          <p className="text-sm text-[#9d8ab5] mb-4">
            {archived
              ? "This class is archived. It is hidden from the main dashboard but all content is preserved."
              : "Archiving this class will hide it from the main dashboard. All content is preserved."}
          </p>
          <button
            onClick={() => {
              setArchiving(true);
              updateClass(classId, { archived: !archived });
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
      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-[#f8f4ff] mb-4">
            Students ({students.length})
          </h3>
          {students.length === 0 ? (
            <p className="text-sm text-[#7b6b8d]">
              No students enrolled yet. Share the class code to invite students.
            </p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-surface rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-[#f8f4ff]">
                      {student.full_name}
                    </p>
                    <p className="text-xs text-[#7b6b8d]">
                      {student.email} · ID: {student.student_id}
                    </p>
                    <p className="text-xs text-[#6b5b7d]">
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
      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg border border-red-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-red-800 mb-4">Danger Zone</h3>
          <p className="text-sm text-[#9d8ab5] mb-4">
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
