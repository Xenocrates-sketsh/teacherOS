"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StudentJoinPage() {
  const router = useRouter();
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    // Look up the class code
    const { data: codeData, error: codeError } = await supabase
      .from("class_codes")
      .select("class_id, is_active")
      .eq("code", classCode.toUpperCase())
      .single();

    if (codeError || !codeData) {
      setError("Invalid class code");
      setLoading(false);
      return;
    }

    if (!codeData.is_active) {
      setError("This class code is no longer active");
      setLoading(false);
      return;
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from("student_classes")
      .select("student_id")
      .eq("student_id", user.id)
      .eq("class_id", codeData.class_id)
      .single();

    if (existingEnrollment) {
      setError("You are already enrolled in this class");
      setLoading(false);
      return;
    }

    // Get class info for success message
    const { data: classData } = await supabase
      .from("classes")
      .select("name, schools(name)")
      .eq("id", codeData.class_id)
      .single();

    // Enroll in class
    const { error: enrollError } = await supabase
      .from("student_classes")
      .insert({
        student_id: user.id,
        class_id: codeData.class_id,
      });

    if (enrollError) {
      setError("Failed to enroll in class");
      setLoading(false);
      return;
    }

    setSuccess(
      `Successfully joined ${classData?.schools?.name} - ${classData?.name}!`
    );
    setClassCode("");
    setLoading(false);

    // Redirect to student dashboard after 2 seconds
    setTimeout(() => {
      router.push("/student");
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Join a Class</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the class code provided by your teacher.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleJoin}>
          <div>
            <label
              htmlFor="classCode"
              className="block text-sm font-medium text-gray-700"
            >
              Class Code
            </label>
            <input
              id="classCode"
              name="classCode"
              type="text"
              required
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-lg tracking-widest font-mono"
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
