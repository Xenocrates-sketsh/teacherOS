"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    const supabase = createClient();

    const { data: profile } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", studentId)
      .single();

    const { data: stuProfile } = await supabase
      .from("student_profiles")
      .select("student_id")
      .eq("user_id", studentId)
      .single();

    setStudent({
      full_name: profile?.full_name || "Unknown",
      email: profile?.email || "",
      student_id: (stuProfile as any)?.student_id || "N/A",
    });

    const { data: enrollments } = await supabase
      .from("student_classes")
      .select("class_id, classes(name)")
      .eq("student_id", studentId);

    const allGrades: GradeItem[] = [];

    for (const enrollment of enrollments || []) {
      const { data: workspaces } = await supabase
        .from("subject_workspaces")
        .select("id, name")
        .eq("class_id", enrollment.class_id);

      for (const ws of workspaces || []) {
        const { data: homework } = await supabase
          .from("homework")
          .select("id, title")
          .eq("workspace_id", ws.id);

        for (const hw of homework || []) {
          const { data: submission } = await supabase
            .from("submissions")
            .select("id")
            .eq("homework_id", hw.id)
            .eq("student_id", studentId)
            .maybeSingle();

          let score = null, maxScore = 100, graded = false;
          if (submission) {
            const { data: g } = await supabase
              .from("grades")
              .select("score, max_score")
              .eq("submission_id", submission.id)
              .maybeSingle();
            if (g) {
              score = g.score;
              maxScore = g.max_score;
              graded = true;
            }
          }

          allGrades.push({
            class_name: (enrollment.classes as any).name,
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
  };

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
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading report...</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Button variant="secondary" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-1" />
          Print Report
        </Button>
      </div>

      <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Progress Report</h1>
          <p className="text-gray-500 mt-1">Teacher Workspace</p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Student Name</p>
              <p className="font-medium text-gray-900">{student?.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Student ID</p>
              <p className="font-medium text-gray-900">{student?.student_id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Email</p>
              <p className="font-medium text-gray-900">{student?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Overall Average</p>
              <p className={`font-medium text-lg ${overallAverage !== null ? (overallAverage >= 70 ? "text-green-600" : overallAverage >= 50 ? "text-yellow-600" : "text-red-600") : "text-gray-400"}`}>
                {overallAverage !== null ? `${overallAverage}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {grades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No grades recorded yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Workspace</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Assignment</th>
                <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map((g, i) => (
                <tr key={i}>
                  <td className="py-3 text-sm text-gray-900">{g.class_name}</td>
                  <td className="py-3 text-sm text-gray-600">{g.workspace_name}</td>
                  <td className="py-3 text-sm text-gray-900">{g.homework_title}</td>
                  <td className="py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      g.graded ? "bg-green-100 text-green-700" :
                      g.submitted ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
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
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
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
