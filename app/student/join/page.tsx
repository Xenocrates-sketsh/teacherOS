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

    const { data: classData } = await supabase
      .from("classes")
      .select("name, schools(name)")
      .eq("id", codeData.class_id)
      .single();

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
