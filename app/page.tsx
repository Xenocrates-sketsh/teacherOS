import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  MessageSquare,
  Calendar,
  FileCheck,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Class Management",
    description: "Create schools, classes, and subject workspaces with ease",
  },
  {
    icon: BookOpen,
    title: "Content Sharing",
    description: "Share lessons, homework, announcements, and resources",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Communicate instantly with students and teachers",
  },
  {
    icon: FileCheck,
    title: "Grading System",
    description: "Submit assignments, grade work, and track progress",
  },
  {
    icon: Calendar,
    title: "Calendar",
    description: "Manage schedules, deadlines, and events",
  },
  {
    icon: GraduationCap,
    title: "Student Dashboard",
    description: "Students can join classes and access all materials",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-gold-400" />
          <span className="text-xl font-bold text-[#f8f4ff]">
            Teacher Workspace
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-[#cbd5e1] hover:text-[#f8f4ff] transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium btn-gold transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold text-[#f8f4ff] mb-6 leading-tight">
            The Modern Platform for
            <br />
            <span className="text-gold-400">Teachers & Students</span>
          </h1>
          <p className="text-xl text-[#9d8ab5] mb-10 max-w-2xl mx-auto">
            Manage classes, share content, communicate in real-time, and track
            student progress — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 text-base font-medium btn-gold transition-colors shadow-md"
            >
              Start as Teacher
            </Link>
            <Link
              href="/join"
              className="px-8 py-3 text-base font-medium text-gold-400 bg-surface-card/80 backdrop-blur-xl border-2 border-gold-400/20 rounded-lg hover:bg-[rgba(124,58,237,0.1)] transition-colors"
            >
              Join as Student
            </Link>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-[#f8f4ff] text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface-card/80 backdrop-blur-xl rounded-xl p-6 shadow-sm border border-[rgba(212,175,55,0.08)] hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[rgba(124,58,237,0.1)] rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#f8f4ff] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#9d8ab5]">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary-600 py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Classroom?
            </h2>
            <p className="text-[#f8f4ff]/80 mb-8 max-w-xl mx-auto">
              Join thousands of teachers and students already using Teacher
              Workspace.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 text-base font-medium text-gold-400 bg-surface-card/80 backdrop-blur-xl rounded-lg hover:bg-[rgba(212,175,55,0.05)] transition-colors shadow-md"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-surface py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-[#7b6b8d] text-sm">
          &copy; 2024 Teacher Workspace. Built with care for educators.
        </div>
      </footer>
    </div>
  );
}
