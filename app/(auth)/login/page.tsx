"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, initDefaultUsers, getSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initDefaultUsers();
    if (getSession()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { user, error: loginError } = loginUser(email, password);
    if (loginError) {
      setError(loginError);
      setLoading(false);
      return;
    }

    if (user.role === "teacher") {
      router.push("/dashboard");
    } else {
      router.push("/student");
    }
  };

  return (
    <div className="glass-card p-8">
      <form className="space-y-6" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#cbd5e1]">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#cbd5e1]">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm" />
        </div>
        {error && <div className="text-red-600 text-sm bg-red-500/100/100/100/100/100/100/10 p-3 rounded-md">{error}</div>}
        <div>
          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white btn-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(212,175,55,0.1)]" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-surface-card/80 backdrop-blur-xl text-[#7b6b8d]">New to Teacher Workspace?</span></div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/register?role=teacher"
            className="w-full flex justify-center py-2 px-4 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm text-sm font-medium text-[#cbd5e1] bg-surface-card/80 backdrop-blur-xl hover:bg-[rgba(212,175,55,0.05)]">Teacher Sign Up</Link>
          <Link href="/join"
            className="w-full flex justify-center py-2 px-4 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm text-sm font-medium text-[#cbd5e1] bg-surface-card/80 backdrop-blur-xl hover:bg-[rgba(212,175,55,0.05)]">Join as Student</Link>
        </div>
      </div>
      <div className="mt-4 text-xs text-[#6b5b7d] text-center">Demo teacher: admin@teacher.com / admin123</div>
    </div>
  );
}
