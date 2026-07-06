"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  BookOpen,
  MessageSquare,
  Calendar,
  FileCheck,
  Sparkles,
  ArrowRight,
  Star,
  Zap,
  Shield,
} from "lucide-react";
import { Globe } from "@/app/components/magicui/globe";

const features = [
  {
    icon: Users,
    title: "Class Management",
    description: "Create schools, classes, and subject workspaces with ease",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: BookOpen,
    title: "Content Sharing",
    description: "Share lessons, homework, announcements, and resources",
    gradient: "from-gold-500 to-amber-500",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Communicate instantly with students and teachers",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: FileCheck,
    title: "Grading System",
    description: "Submit assignments, grade work, and track progress",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Calendar,
    title: "Calendar",
    description: "Manage schedules, deadlines, and events",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: GraduationCap,
    title: "Student Dashboard",
    description: "Students can join classes and access all materials",
    gradient: "from-cyan-500 to-sky-500",
  },
];

const stats = [
  { label: "Active Teachers", value: "12K+" },
  { label: "Students", value: "250K+" },
  { label: "Classes Managed", value: "50K+" },
  { label: "Messages Sent", value: "1M+" },
];

function FloatingOrb({ className }: { className: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-[#0a0015] overflow-hidden">
      <FloatingOrb className="w-96 h-96 bg-purple-600 -top-20 -left-20" />
      <FloatingOrb className="w-80 h-80 bg-gold-500 top-1/3 -right-32" />
      <FloatingOrb className="w-64 h-64 bg-pink-600 bottom-20 left-1/4" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <GraduationCap className="w-8 h-8 text-gold-400" />
            <motion.div
              className="absolute -inset-1 bg-gold-400/30 rounded-full blur-md"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent">
            TeacherOS
          </span>
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium text-[#cbd5e1] hover:text-[#f8f4ff] transition-colors relative group"
          >
            Login
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold-400/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-sm font-medium btn-gold transition-all shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40"
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(212,175,55,0.1)] border border-gold-400/20 text-gold-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              The next generation learning platform
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-[#f8f4ff]">The Modern Platform for</span>
            <br />
            <span className="bg-gradient-to-r from-gold-400 via-amber-300 to-gold-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Teachers & Students
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-[#9d8ab5] mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Manage classes, share content, communicate in real-time, and track
            student progress — all in one beautiful, modern platform.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link
              href="/register"
              className="group relative px-8 py-4 text-base font-medium btn-gold transition-all shadow-lg shadow-gold-500/25 hover:shadow-xl hover:shadow-gold-500/40 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start as Teacher
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </Link>
            <Link
              href="/join"
              className="group px-8 py-4 text-base font-medium text-gold-400 bg-surface-card/80 backdrop-blur-xl border-2 border-gold-400/20 rounded-xl hover:bg-[rgba(212,175,55,0.1)] hover:border-gold-400/40 transition-all"
            >
              <span className="flex items-center gap-2">
                Join as Student
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </section>

        <section className="relative py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative size-full max-w-lg aspect-square">
                <Globe className="top-16" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_150%,rgba(10,0,21,0.8),rgba(10,0,21,1))]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-gradient-to-b from-gold-400 via-amber-300 to-transparent bg-clip-text text-center text-5xl md:text-7xl leading-none font-bold text-transparent select-none">
                  Global
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#f8f4ff] mb-4">
              Everything You Need
            </h2>
            <p className="text-[#9d8ab5] text-lg max-w-xl mx-auto">
              Powerful tools designed to make teaching and learning seamless
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <div className="group relative bg-surface-card/40 backdrop-blur-xl rounded-2xl p-8 border border-[rgba(212,175,55,0.08)] hover:border-gold-400/20 transition-all duration-500 hover:shadow-xl hover:shadow-gold-500/5 hover:-translate-y-1">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#f8f4ff] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#9d8ab5] leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-400/0 via-transparent to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-[#7b6b8d] font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="relative py-24 overflow-hidden">
          <FloatingOrb className="w-72 h-72 bg-gold-500 absolute top-0 right-1/4" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.03)] to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-[#f8f4ff] mb-6 leading-tight">
                Ready to Transform Your
                <br />
                <span className="bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent">
                  Classroom Experience?
                </span>
              </h2>
              <p className="text-lg text-[#9d8ab5] mb-10 max-w-xl mx-auto">
                Join thousands of educators already using TeacherOS to create
                engaging learning environments.
              </p>
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-10 py-4 text-base font-medium btn-gold transition-all shadow-lg shadow-gold-500/25 hover:shadow-xl hover:shadow-gold-500/40"
              >
                Get Started Free
                <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[rgba(212,175,55,0.08)] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-gold-400" />
            <span className="text-sm font-semibold text-[#9d8ab5]">
              TeacherOS
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-[#6b5b7d]">
              &copy; 2024 TeacherOS. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
