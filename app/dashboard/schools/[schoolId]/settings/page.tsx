"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSchools, getTeacherSchools, getUsers } from "@/lib/auth";
import { getSchools as getStoreSchools } from "@/lib/store";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function SchoolSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;
  const [schoolName, setSchoolName] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const schools = getStoreSchools();
    const school = schools.find((s) => s.id === schoolId);
    if (school) setSchoolName(school.name);

    const members = getTeacherSchools(schoolId);
    const allUsers = getUsers();
    const teacherList = members.map((m) => {
      const u = allUsers.find((u) => u.id === m.teacher_id);
      return {
        id: m.teacher_id,
        full_name: u?.full_name || "Unknown",
        email: u?.email || "",
        role: m.role,
      };
    });
    setTeachers(teacherList);
    setLoading(false);
  }, [schoolId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const schools = getStoreSchools();
    const idx = schools.findIndex((s) => s.id === schoolId);
    if (idx !== -1) {
      schools[idx].name = schoolName;
      const STORE_PREFIX = "tw_";
      localStorage.setItem(STORE_PREFIX + "schools", JSON.stringify(schools));
    }

    setMessage({ type: "success", text: "School updated successfully" });
    setSaving(false);
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this school? This action cannot be undone.")) return;

    const schools = getStoreSchools();
    const filtered = schools.filter((s) => s.id !== schoolId);
    const STORE_PREFIX = "tw_";
    localStorage.setItem(STORE_PREFIX + "schools", JSON.stringify(filtered));
    router.push("/dashboard/schools");
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
          href={`/dashboard/schools/${schoolId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to School
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          School Settings
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

      {/* School Name */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            School Information
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="schoolName"
                className="block text-sm font-medium text-gray-700"
              >
                School Name
              </label>
              <input
                id="schoolName"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
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

      {/* Teachers */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Teachers ({teachers.length})
          </h3>
          {teachers.length === 0 ? (
            <p className="text-sm text-gray-500">No teachers yet.</p>
          ) : (
            <div className="space-y-3">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {teacher.full_name}
                    </p>
                    <p className="text-xs text-gray-500">{teacher.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      teacher.role === "admin"
                        ? "bg-primary-100 text-primary-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {teacher.role === "admin" ? "Admin" : "Teacher"}
                  </span>
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
            Deleting this school will permanently remove all classes, workspaces,
            and content associated with it.
          </p>
          <button
            onClick={handleDelete}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete School
          </button>
        </div>
      </div>
    </div>
  );
}
