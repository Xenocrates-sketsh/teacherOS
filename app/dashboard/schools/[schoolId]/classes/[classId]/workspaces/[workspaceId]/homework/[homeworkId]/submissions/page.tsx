"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getSubmissions, saveSubmission, getGrades, saveGrade, getUsers } from "@/lib/auth";
import { getSubmissions as getStoreSubmissions, getGrades as getStoreGrades, saveGrade as saveStoreGrade } from "@/lib/store";
import { ArrowLeft, Download, FileText, CheckCircle, Clock } from "lucide-react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Badge from "@/app/components/ui/Badge";

interface Submission {
  id: string;
  student_id: string;
  student_name: string;
  content: string | null;
  file_url: string | null;
  submitted_at: string;
  grade_id: string | null;
  score: number | null;
  max_score: number;
  feedback: string | null;
}

export default function SubmissionsPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const workspaceId = params.workspaceId as string;
  const homeworkId = params.homeworkId as string;
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const subs = getStoreSubmissions(homeworkId);
    const allUsers = getUsers();

    const submissionData: Submission[] = subs.map((sub) => {
      const grades = getStoreGrades(sub.id);
      const grade = grades[0];
      const u = allUsers.find((user) => user.id === sub.student_id);
      return {
        id: sub.id,
        student_id: sub.student_id,
        student_name: u?.full_name || "Unknown",
        content: sub.content,
        file_url: sub.file_url,
        submitted_at: sub.submitted_at,
        grade_id: grade?.id || null,
        score: grade?.score || null,
        max_score: grade?.max_score || 100,
        feedback: grade?.feedback || null,
      };
    });

    setSubmissions(submissionData);
    setLoading(false);
  }, [homeworkId]);

  const handleGrade = (submissionId: string) => {
    setSaving(submissionId);
    const session = getSession();

    if (!session) {
      setSaving(null);
      return;
    }

    const parsedScore = parseFloat(score);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      setSaving(null);
      return;
    }

    const grades = getStoreGrades(submissionId);
    const existingGrade = grades[0];

    if (existingGrade) {
      const STORE_PREFIX = "tw_";
      const allGrades = getStoreGrades();
      const idx = allGrades.findIndex((g) => g.id === existingGrade.id);
      if (idx !== -1) {
        allGrades[idx].score = parsedScore;
        allGrades[idx].feedback = feedback;
        allGrades[idx].graded_at = new Date().toISOString();
        localStorage.setItem(STORE_PREFIX + "grades", JSON.stringify(allGrades));
      }
    } else {
      saveStoreGrade({
        submission_id: submissionId,
        teacher_id: session.id,
        score: parsedScore,
        max_score: 100,
        feedback,
      });
    }

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? { ...sub, score: parsedScore, feedback }
          : sub
      )
    );

    setSuccessMsg("Grade saved!");
    setTimeout(() => setSuccessMsg(null), 2000);
    setGrading(null);
    setSaving(null);
    setScore("");
    setFeedback("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#7b6b8d]">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}`}
          className="inline-flex items-center gap-1 text-sm text-[#7b6b8d] hover:text-[#cbd5e1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-[#f8f4ff]">Submissions</h1>
            <p className="text-[#7b6b8d] mt-1">
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            </p>
          </div>
          {successMsg && (
            <div className="flex items-center gap-1 text-sm text-green-600 bg-green-500/100/100/100/100/100/100/10 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4" />
              {successMsg}
            </div>
          )}
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#f8f4ff] mb-2">
            No submissions yet
          </h3>
          <p className="text-[#7b6b8d]">
            Students haven&apos;t submitted their work yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[rgba(124,58,237,0.1)] rounded-full flex items-center justify-center text-gold-400 font-medium">
                    {sub.student_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#f8f4ff]">
                      {sub.student_name}
                    </h3>
                    <p className="text-sm text-[#7b6b8d]">
                      Submitted{" "}
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {sub.score !== null ? (
                  <Badge variant="success">
                    {sub.score} / {sub.max_score}
                  </Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </div>

              {sub.content && (
                <div className="mt-4 p-3 bg-surface rounded-lg text-sm text-[#cbd5e1]">
                  {sub.content}
                </div>
              )}

              {sub.file_url && (
                <div className="mt-4">
                  <a
                    href={sub.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm link-gold"
                  >
                    <FileText className="w-4 h-4" />
                    View attached file
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              )}

              {sub.feedback && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <strong>Feedback:</strong> {sub.feedback}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                {grading === sub.id ? (
                  <div className="flex gap-2 items-end">
                    <Input
                      label="Score"
                      type="number"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="w-24"
                    />
                    <Input
                      label="Feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Optional feedback"
                      className="w-64"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleGrade(sub.id)}
                      disabled={!score || saving === sub.id}
                      loading={saving === sub.id}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setGrading(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant={sub.score !== null ? "secondary" : "primary"}
                    onClick={() => {
                      setGrading(sub.id);
                      setScore(sub.score?.toString() || "");
                      setFeedback(sub.feedback || "");
                    }}
                  >
                    {sub.score !== null ? "Update Grade" : "Grade"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
