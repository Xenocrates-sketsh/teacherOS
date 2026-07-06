"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getUsers } from "@/lib/auth";
import { getStudentClasses, getWorkspaces, getHomeworkList, getSubmissions, getGrades } from "@/lib/store";
import { ArrowLeft, Printer } from "lucide-react";
import Button from "@/app/components/ui/Button";

interface GradeItem {
  class_name: string;
  workspace_name: string;
  homework_title: string;
  score: number | null;
  max_score: number;
  submitted: boolean;
  graded: boolean;
}

interface StudentInfo {
  full_name: string;
  email: string;
  student_id: string;
}

export default function StudentReportPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allUsers = getUsers();
    const profile = allUsers.find((u) => u.id === studentId);

    setStudent({
      full_name: profile?.full_name || "Unknown",
      email: profile?.email || "",
      student_id: studentId,
    });

    const enrollments = getStudentClasses(studentId);

    const allGrades: GradeItem[] = [];

    for (const enrollment of enrollments) {
      const workspaces = getWorkspaces(enrollment.class_id);

      for (const ws of workspaces) {
        const homework = getHomeworkList(ws.id);

        for (const hw of homework) {
          const subs = getSubmissions(hw.id, studentId);
          const submission = subs[0];

          let score = null, maxScore = 100, graded = false;
          if (submission) {
            const g = getGrades(submission.id);
            const grade = g[0];
            if (grade) {
              score = grade.score;
              maxScore = grade.max_score;
              graded = true;
            }
          }

          allGrades.push({
            class_name: enrollment.class_id,
            workspace_name: ws.name,
            homework_title: hw.title,
            score,
            max_score: maxScore,
            submitted: !!submission,
            graded,
          });
        }
      }
    }

    setGrades(allGrades);
    setLoading(false);
  }, [studentId]);

  const handlePrint = () => {
    window.print();
  };

  const overallAverage = (() => {
    const graded = grades.filter((g) => g.graded);
    if (graded.length === 0) return null;
    const total = graded.reduce((sum, g) => sum + (g.score || 0) / g.max_score, 0);
    return Math.round((total / graded.length) * 100);
  })();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[#7b6b8d]">Loading report...</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[#7b6b8d] hover:text-[#cbd5e1]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Button variant="secondary" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-1" />
          Print Report
        </Button>
      </div>

      <div ref={printRef} className="glass-card p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#f8f4ff]">Progress Report</h1>
          <p className="text-[#7b6b8d] mt-1">Teacher Workspace</p>
        </div>

        <div className="border-t border-b border-[rgba(212,175,55,0.1)] py-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#7b6b8d] uppercase">Student Name</p>
              <p className="font-medium text-[#f8f4ff]">{student?.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-[#7b6b8d] uppercase">Student ID</p>
              <p className="font-medium text-[#f8f4ff]">{student?.student_id}</p>
            </div>
            <div>
              <p className="text-xs text-[#7b6b8d] uppercase">Email</p>
              <p className="font-medium text-[#f8f4ff]">{student?.email}</p>
            </div>
            <div>
              <p className="text-xs text-[#7b6b8d] uppercase">Overall Average</p>
              <p className={`font-medium text-lg ${overallAverage !== null ? (overallAverage >= 70 ? "text-green-600" : overallAverage >= 50 ? "text-yellow-600" : "text-red-600") : "text-[#6b5b7d]"}`}>
                {overallAverage !== null ? `${overallAverage}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {grades.length === 0 ? (
          <div className="text-center py-8 text-[#7b6b8d]">No grades recorded yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(212,175,55,0.1)]">
                <th className="text-left py-3 text-xs font-medium text-[#7b6b8d] uppercase">Class</th>
                <th className="text-left py-3 text-xs font-medium text-[#7b6b8d] uppercase">Workspace</th>
                <th className="text-left py-3 text-xs font-medium text-[#7b6b8d] uppercase">Assignment</th>
                <th className="text-center py-3 text-xs font-medium text-[#7b6b8d] uppercase">Status</th>
                <th className="text-right py-3 text-xs font-medium text-[#7b6b8d] uppercase">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map((g, i) => (
                <tr key={i}>
                  <td className="py-3 text-sm text-[#f8f4ff]">{g.class_name}</td>
                  <td className="py-3 text-sm text-[#9d8ab5]">{g.workspace_name}</td>
                  <td className="py-3 text-sm text-[#f8f4ff]">{g.homework_title}</td>
                  <td className="py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      g.graded ? "bg-green-100 text-green-700" :
                      g.submitted ? "bg-yellow-100 text-yellow-700" :
                      "bg-surface-card text-[#9d8ab5]"
                    }`}>
                      {g.graded ? "Graded" : g.submitted ? "Submitted" : "Not Submitted"}
                    </span>
                  </td>
                  <td className="py-3 text-right text-sm font-medium">
                    {g.graded ? (
                      <span className={g.score! >= 70 ? "text-green-600" : g.score! >= 50 ? "text-yellow-600" : "text-red-600"}>
                        {g.score} / {g.max_score}
                      </span>
                    ) : (
                      <span className="text-[#6b5b7d]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-8 pt-6 border-t border-[rgba(212,175,55,0.1)] text-center text-xs text-[#6b5b7d]">
          Generated on {new Date().toLocaleDateString()} · Teacher Workspace
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
