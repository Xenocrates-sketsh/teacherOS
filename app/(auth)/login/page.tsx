"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { loginUser, initDefaultUsers, getSession } from "@/lib/auth";
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <motion.div
            className="flex items-center justify-center gap-2 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative">
              <GraduationCap className="w-8 h-8 text-gold-400" />
              <div className="absolute -inset-1 bg-gold-400/20 rounded-full blur-md" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent">
              TeacherOS
            </span>
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-[#f8f4ff] text-center mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome Back
          </motion.h2>
          <motion.p
            className="text-[#7b6b8d] text-center text-sm mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Sign in to your account to continue
          </motion.p>

          <form className="space-y-5" onSubmit={handleLogin}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5b7d] group-focus-within:text-gold-400 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-10 pr-3 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(212,175,55,0.12)] rounded-xl text-sm text-[#f8f4ff] placeholder-[#6b5b7d] focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5b7d] group-focus-within:text-gold-400 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(212,175,55,0.12)] rounded-xl text-sm text-[#f8f4ff] placeholder-[#6b5b7d] focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5b7d] hover:text-[#9d8ab5] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-3 btn-gold rounded-xl text-sm font-semibold transition-all shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </span>
              </button>
            </motion.div>
          </form>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(212,175,55,0.08)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-surface-card text-[#6b5b7d]">
                  New here?
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/register?role=teacher"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[rgba(212,175,55,0.12)] rounded-xl text-sm font-medium text-[#cbd5e1] hover:bg-[rgba(212,175,55,0.05)] hover:border-gold-400/20 transition-all"
              >
                <GraduationCap className="w-4 h-4" />
                Teacher Sign Up
              </Link>
              <Link
                href="/join"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[rgba(212,175,55,0.12)] rounded-xl text-sm font-medium text-[#cbd5e1] hover:bg-[rgba(212,175,55,0.05)] hover:border-gold-400/20 transition-all"
              >
                Join as Student
              </Link>
            </div>
          </motion.div>

          <motion.p
            className="mt-6 text-xs text-[#5a4b6d] text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Demo: <span className="text-[#7b6b8d]">admin@teacher.com</span> / <span className="text-[#7b6b8d]">admin123</span>
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
