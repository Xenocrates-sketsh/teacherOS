"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Users, BookOpen } from "lucide-react";
import Badge from "@/app/components/ui/Badge";

interface StudentGrade {
  student_id: string;
  student_name: string;
  homework_id: string;
  homework_title: string;
  score: number | null;
  max_score: number;
  submitted: boolean;
  graded: boolean;
}

export default function GradesPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: enrollments } = await supabase
        .from("student_classes")
        .select("student_id, users(*)")
        .eq("class_id", classId);

      const studentList = enrollments?.map((e: any) => e.users?.[0] || e.users) || [];
      setStudents(studentList);

      const { data: workspaces } = await supabase
        .from("subject_workspaces")
        .select("id")
        .eq("class_id", classId);

      const { data: homeworkList } = await supabase
        .from("homework")
        .select("id, title, workspace_id")
        .in(
          "workspace_id",
          workspaces?.map((w) => w.id) || []
        );

      const gradeData: StudentGrade[] = [];

      for (const student of studentList) {
        for (const hw of homeworkList || []) {
          const { data: submission } = await supabase
            .from("submissions")
            .select("id, file_url, content")
            .eq("homework_id", hw.id)
            .eq("student_id", student.id)
            .single();

          let grade = null;
          let maxScore = 100;
          let graded = false;

          if (submission) {
            const { data: gradeData_item } = await supabase
              .from("grades")
              .select("score, max_score")
              .eq("submission_id", submission.id)
              .single();

            if (gradeData_item) {
              grade = gradeData_item.score;
              maxScore = gradeData_item.max_score;
              graded = true;
            }
          }

          gradeData.push({
            student_id: student.id,
            student_name: student.full_name,
            homework_id: hw.id,
            homework_title: hw.title,
            score: grade,
            max_score: maxScore,
            submitted: !!submission,
            graded,
          });
        }
      }

      setGrades(gradeData);
      setLoading(false);
    };

    fetchData();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading grades...</div>
      </div>
    );
  }

  const getStudentAverage = (studentId: string) => {
    const studentGrades = grades.filter(
      (g) => g.student_id === studentId && g.graded
    );
    if (studentGrades.length === 0) return null;
    const total = studentGrades.reduce(
      (sum, g) => sum + (g.score || 0) / g.max_score,
      0
    );
    return Math.round((total / studentGrades.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/schools/${schoolId}/classes/${classId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Class
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Gradebook</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Student
                </th>
                <th className="text-center px-4 py-4 text-sm font-medium text-gray-500">
                  Average
                </th>
                <th className="text-center px-4 py-4 text-sm font-medium text-gray-500">
                  Submissions
                </th>
                <th className="text-center px-4 py-4 text-sm font-medium text-gray-500">
                  Graded
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => {
                const studentGrades = grades.filter(
                  (g) => g.student_id === student.id
                );
                const submitted = studentGrades.filter(
                  (g) => g.submitted
                ).length;
                const graded = studentGrades.filter((g) => g.graded).length;
                const average = getStudentAverage(student.id);

                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-medium">
                          {student.full_name?.charAt(0) || "S"}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {student.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {average !== null ? (
                        <Badge
                          variant={
                            average >= 70
                              ? "success"
                              : average >= 50
                              ? "warning"
                              : "danger"
                          }
                        >
                          {average}%
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {submitted} / {studentGrades.length}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {graded} / {studentGrades.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
