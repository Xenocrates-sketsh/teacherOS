"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getClassCodes, getClasses, enrollStudent, getStudentClasses } from "@/lib/store";

export default function StudentJoinPage() {
  const router = useRouter();
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const session = getSession();

    if (!session) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const allCodes = getClassCodes();
    const codeData = allCodes.find(
      (c) => c.code === classCode.toUpperCase()
    );

    if (!codeData) {
      setError("Invalid class code");
      setLoading(false);
      return;
    }

    if (!codeData.is_active) {
      setError("This class code is no longer active");
      setLoading(false);
      return;
    }

    const existingEnrollment = getStudentClasses(session.id, codeData.class_id);
    if (existingEnrollment.length > 0) {
      setError("You are already enrolled in this class");
      setLoading(false);
      return;
    }

    const classes = getClasses();
    const classData = classes.find((c) => c.id === codeData.class_id);

    enrollStudent(session.id, codeData.class_id);

    setSuccess(
      `Successfully joined ${classData?.name}!`
    );
    setClassCode("");
    setLoading(false);

    setTimeout(() => {
      router.push("/student");
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Join a Class</h1>
      <p className="text-gray-500 mb-6">Enter the class code from your teacher.</p>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <input
              type="text"
              required
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Class"}
          </button>
        </form>
      </div>
    </div>
  );
}
