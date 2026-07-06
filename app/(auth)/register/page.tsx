"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, initDefaultUsers, getSession } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initDefaultUsers();
    if (getSession()) {
      router.push("/dashboard");
    }
  }, [router]);

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

    const { user, error: regError } = registerUser(email, password, fullName, "teacher");
    if (regError) {
      setError(regError);
      setLoading(false);
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="rounded-full bg-green-100 p-3 w-12 h-12 mx-auto flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[#f8f4ff]">Account created!</h2>
        <p className="mt-2 text-sm text-[#9d8ab5]">Welcome, {fullName}! You&apos;re now logged in.</p>
        <div className="mt-6">
          <a href="/dashboard" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white btn-gold">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      <form className="space-y-6" onSubmit={handleRegister}>
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-[#cbd5e1]">Full Name</label>
          <input id="fullName" name="fullName" type="text" autoComplete="name" required value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#cbd5e1]">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#cbd5e1]">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#cbd5e1]">Confirm Password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm" />
        </div>
        {error && <div className="text-red-600 text-sm bg-red-500/100/100/100/100/100/100/10 p-3 rounded-md">{error}</div>}
        <div>
          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white btn-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Creating account..." : "Create Teacher Account"}
          </button>
        </div>
      </form>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(212,175,55,0.1)]" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-surface-card/80 backdrop-blur-xl text-[#7b6b8d]">Already have an account?</span></div>
        </div>
        <div className="mt-6">
          <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm text-sm font-medium text-[#cbd5e1] bg-surface-card/80 backdrop-blur-xl hover:bg-[rgba(212,175,55,0.05)]">Sign in to existing account</Link>
        </div>
      </div>
    </div>
  );
}
