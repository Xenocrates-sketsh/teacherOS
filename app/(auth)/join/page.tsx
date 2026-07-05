"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, initDefaultUsers, getSession } from "@/lib/auth";
import { getClassCodes, getClasses, enrollStudent, getSchools } from "@/lib/store";

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState<"code" | "register">("code");
  const [classCode, setClassCode] = useState("");
  const [classInfo, setClassInfo] = useState<{ class_id: string; class_name: string; school_name: string } | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initDefaultUsers();
  }, []);

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const code = classCode.toUpperCase();
    const codes = getClassCodes();
    const match = codes.find((c) => c.code === code && c.is_active);

    if (!match) {
      setError("Invalid class code");
      setLoading(false);
      return;
    }

    const classes = getClasses();
    const cls = classes.find((c) => c.id === match.class_id);
    if (!cls) {
      setError("Class not found");
      setLoading(false);
      return;
    }

    const schools = getSchools();
    const school = schools.find((s) => s.id === cls.school_id);

    setClassInfo({
      class_id: cls.id,
      class_name: cls.name,
      school_name: school?.name || "Unknown School",
    });
    setStep("register");
    setLoading(false);
  };

  const handleRegister = (e: React.FormEvent) => {
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

    const { user, error: regError } = registerUser(email, password, fullName, "student");
    if (regError) {
      setError(regError);
      setLoading(false);
      return;
    }

    if (classInfo) {
      enrollStudent(user!.id, classInfo.class_id);
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <div className="rounded-full bg-green-100 p-3 w-12 h-12 mx-auto flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Welcome to the class!</h2>
        <p className="mt-2 text-sm text-gray-600">You&apos;re now enrolled and logged in.</p>
        <div className="mt-6">
          <a href="/student" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {step === "code" ? (
        <form className="space-y-6" onSubmit={handleVerifyCode}>
          <div>
            <label htmlFor="classCode" className="block text-sm font-medium text-gray-700">Enter Class Code</label>
            <input id="classCode" name="classCode" type="text" required value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-lg tracking-widest font-mono" />
          </div>
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
          <div>
            <button type="submit" disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        </form>
      ) : (
        <>
          {classInfo && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800"><span className="font-medium">Class found!</span></p>
              <p className="text-sm text-green-700 mt-1">{classInfo.school_name} - {classInfo.class_name}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input id="fullName" name="fullName" type="text" autoComplete="name" required value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep("code"); setClassInfo(null); setError(null); }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Back</button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Creating account..." : "Join Class"}
              </button>
            </div>
          </form>
        </>
      )}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Already have an account?</span></div>
        </div>
        <div className="mt-6">
          <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Sign in to existing account</Link>
        </div>
      </div>
    </div>
  );
}
