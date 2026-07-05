"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getWorkspaces, getHomeworkList, getSubmissions, getGrades } from "@/lib/store";
import { ArrowLeft, BookOpen } from "lucide-react";
import Badge from "@/app/components/ui/Badge";

interface GradeItem {
  homework_id: string;
  homework_title: string;
  workspace_name: string;
  score: number | null;
  max_score: number;
  submitted: boolean;
  graded: boolean;
  feedback: string | null;
}

export default function StudentGradesPage() {
  const params = useParams();
  const classId = params.classId as string;
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    const workspaces = getWorkspaces(classId);
    const workspaceIds = workspaces.map((w) => w.id);
    const homeworkList = workspaceIds.length > 0
      ? getHomeworkList().filter((h) => workspaceIds.includes(h.workspace_id))
      : [];

    const gradeData: GradeItem[] = [];

    for (const hw of homeworkList) {
      const workspace = workspaces.find((w) => w.id === hw.workspace_id);

      const subs = getSubmissions(hw.id, session.id);
      const submission = subs[0];

      let score = null;
      let maxScore = 100;
      let graded = false;
      let feedback = null;

      if (submission) {
        const gradeList = getGrades(submission.id);
        const grade = gradeList[0];
        if (grade) {
          score = grade.score;
          maxScore = grade.max_score;
          graded = true;
          feedback = grade.feedback;
        }
      }

      gradeData.push({
        homework_id: hw.id,
        homework_title: hw.title,
        workspace_name: workspace?.name || "Unknown",
        score,
        max_score: maxScore,
        submitted: !!submission,
        graded,
        feedback,
      });
    }

    setGrades(gradeData);
    setLoading(false);
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading grades...</div>
      </div>
    );
  }

  const overallAverage = () => {
    const gradedItems = grades.filter((g) => g.graded);
    if (gradedItems.length === 0) return null;
    const total = gradedItems.reduce(
      (sum, g) => sum + (g.score || 0) / g.max_score,
      0
    );
    return Math.round((total / gradedItems.length) * 100);
  };

  const average = overallAverage();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/student/classes/${classId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Class
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
          {average !== null && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Overall Average</p>
              <p className="text-2xl font-bold text-gray-900">{average}%</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Assignment
                </th>
                <th className="text-left px-4 py-4 text-sm font-medium text-gray-500">
                  Workspace
                </th>
                <th className="text-center px-4 py-4 text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="text-center px-4 py-4 text-sm font-medium text-gray-500">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No homework yet</p>
                  </td>
                </tr>
              ) : (
                grades.map((grade) => (
                  <tr key={grade.homework_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {grade.homework_title}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {grade.workspace_name}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {!grade.submitted ? (
                        <Badge variant="danger">Not Submitted</Badge>
                      ) : grade.graded ? (
                        <Badge variant="success">Graded</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {grade.graded ? (
                        <span className="text-sm font-semibold text-gray-900">
                          {grade.score} / {grade.max_score}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
