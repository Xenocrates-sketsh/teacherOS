"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState<"code" | "register">("code");
  const [classCode, setClassCode] = useState("");
  const [classInfo, setClassInfo] = useState<{
    class_id: string;
    class_name: string;
    school_id: string;
    school_name: string;
  } | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

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

    // Get class and school info
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("id, name, school_id, schools(name)")
      .eq("id", codeData.class_id)
      .single();

    if (classError || !classData) {
      setError("Class not found");
      setLoading(false);
      return;
    }

    setClassInfo({
      class_id: classData.id,
      class_name: classData.name,
      school_id: classData.school_id,
      school_name: (classData.schools as any).name,
    });
    setStep("register");
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("An account with this email may already exist. Try logging in.");
      setLoading(false);
      return;
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: email,
      role: "student",
      full_name: fullName,
    });

    if (profileError) {
      setError("Failed to create profile. Please try again.");
      setLoading(false);
      return;
    }

    // Create student profile
    const studentId = `STU${Date.now().toString(36).toUpperCase()}`;
    await supabase
      .from("student_profiles")
      .insert({
        user_id: authData.user.id,
        student_id: studentId,
        school_id: classInfo?.school_id,
      })
      .then(() => {})
      .catch(() => {});

    // Enroll in class
    const { error: enrollError } = await supabase
      .from("student_classes")
      .insert({
        student_id: authData.user.id,
        class_id: classInfo?.class_id,
      });

    if (enrollError) {
      setError("Failed to enroll in class");
      setLoading(false);
      return;
    }

    if (authData.session) {
      router.push("/student");
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <div className="rounded-full bg-green-100 p-3 w-12 h-12 mx-auto flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Check your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then log in to access your class.
        </p>
        <div className="mt-6">
          <a href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {step === "code" ? (
        <form className="space-y-6" onSubmit={handleVerifyCode}>
          <div>
            <label
              htmlFor="classCode"
              className="block text-sm font-medium text-gray-700"
            >
              Enter Class Code
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        </form>
      ) : (
        <>
          {classInfo && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <span className="font-medium">Class found!</span>
              </p>
              <p className="text-sm text-green-700 mt-1">
                {classInfo.school_name} - {classInfo.class_name}
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("code");
                  setClassInfo(null);
                  setError(null);
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Join Class"}
              </button>
            </div>
          </form>
        </>
      )}

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Already have an account?
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Sign in to existing account
          </Link>
        </div>
      </div>
    </div>
  );
}
