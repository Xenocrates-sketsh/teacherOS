"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { registerUser, initDefaultUsers, getSession } from "@/lib/auth";
import { GraduationCap, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="glass-card p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 to-purple-500/5" />
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-[#f8f4ff] mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Account Created!
            </motion.h2>
            <motion.p
              className="text-[#9d8ab5] mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Welcome, {fullName}! You&apos;re now logged in.
            </motion.p>
            <motion.a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 btn-gold rounded-xl text-sm font-semibold shadow-lg shadow-gold-500/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Go to Dashboard
            </motion.a>
          </div>
        </div>
      </motion.div>
    );
  }

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
            Create Account
          </motion.h2>
          <motion.p
            className="text-[#7b6b8d] text-center text-sm mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Start your teaching journey today
          </motion.p>

          <form className="space-y-5" onSubmit={handleRegister}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5b7d] group-focus-within:text-gold-400 transition-colors" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-3 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(212,175,55,0.12)] rounded-xl text-sm text-[#f8f4ff] placeholder-[#6b5b7d] focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all"
                />
              </div>
            </motion.div>

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
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-3 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(212,175,55,0.12)] rounded-xl text-sm text-[#f8f4ff] placeholder-[#6b5b7d] focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5b7d] group-focus-within:text-gold-400 transition-colors" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-3 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(212,175,55,0.12)] rounded-xl text-sm text-[#f8f4ff] placeholder-[#6b5b7d] focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-all"
                />
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
              transition={{ duration: 0.5, delay: 0.45 }}
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
                      Creating account...
                    </span>
                  ) : (
                    "Create Teacher Account"
                  )}
                </span>
              </button>
            </motion.div>
          </form>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(212,175,55,0.08)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-surface-card text-[#6b5b7d]">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[rgba(212,175,55,0.12)] rounded-xl text-sm font-medium text-[#cbd5e1] hover:bg-[rgba(212,175,55,0.05)] hover:border-gold-400/20 transition-all"
              >
                Sign in to existing account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
