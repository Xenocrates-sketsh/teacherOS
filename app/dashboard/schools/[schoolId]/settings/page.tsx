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
        <div className="text-[#7b6b8d]">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/schools/${schoolId}`}
          className="text-sm text-[#7b6b8d] hover:text-[#cbd5e1]"
        >
          ← Back to School
        </Link>
        <h1 className="text-2xl font-bold text-[#f8f4ff] mt-2">
          School Settings
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

      {/* School Name */}
      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-[#f8f4ff] mb-4">
            School Information
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="schoolName"
                className="block text-sm font-medium text-[#cbd5e1]"
              >
                School Name
              </label>
              <input
                id="schoolName"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
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

      {/* Teachers */}
      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-[#f8f4ff] mb-4">
            Teachers ({teachers.length})
          </h3>
          {teachers.length === 0 ? (
            <p className="text-sm text-[#7b6b8d]">No teachers yet.</p>
          ) : (
            <div className="space-y-3">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-3 bg-surface rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-[#f8f4ff]">
                      {teacher.full_name}
                    </p>
                    <p className="text-xs text-[#7b6b8d]">{teacher.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      teacher.role === "admin"
                        ? "bg-[rgba(124,58,237,0.1)] text-gold-400"
                        : "bg-surface-card text-gray-800"
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
      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg border border-red-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-red-800 mb-4">Danger Zone</h3>
          <p className="text-sm text-[#9d8ab5] mb-4">
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
