"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
  const router = useRouter();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const workspaceId = params.workspaceId as string;
  const homeworkId = params.homeworkId as string;
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      const supabase = createClient();

      const { data: subs } = await supabase
        .from("submissions")
        .select("*, users!submissions_student_id_fkey(full_name)")
        .eq("homework_id", homeworkId);

      const submissionData: Submission[] = [];

      for (const sub of subs || []) {
        const { data: grade } = await supabase
          .from("grades")
          .select("id, score, max_score, feedback")
          .eq("submission_id", sub.id)
          .single();

        submissionData.push({
          id: sub.id,
          student_id: sub.student_id,
          student_name: sub.users?.full_name || "Unknown",
          content: sub.content,
          file_url: sub.file_url,
          submitted_at: sub.submitted_at,
          grade_id: grade?.id || null,
          score: grade?.score || null,
          max_score: grade?.max_score || 100,
          feedback: grade?.feedback || null,
        });
      }

      setSubmissions(submissionData);
      setLoading(false);
    };

    fetchSubmissions();
  }, [homeworkId]);

  const handleGrade = async (submissionId: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: existingGrade } = await supabase
      .from("grades")
      .select("id")
      .eq("submission_id", submissionId)
      .single();

    if (existingGrade) {
      await supabase
        .from("grades")
        .update({
          score: parseFloat(score),
          feedback,
          graded_at: new Date().toISOString(),
        })
        .eq("id", existingGrade.id);
    } else {
      await supabase.from("grades").insert({
        submission_id: submissionId,
        teacher_id: user.id,
        score: parseFloat(score),
        max_score: 100,
        feedback,
      });
    }

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? { ...sub, score: parseFloat(score), feedback, graded: true }
          : sub
      )
    );

    setGrading(null);
    setScore("");
    setFeedback("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Submissions</h1>
        <p className="text-gray-500 mt-1">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No submissions yet
          </h3>
          <p className="text-gray-500">
            Students haven&apos;t submitted their work yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                    {sub.student_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {sub.student_name}
                    </h3>
                    <p className="text-sm text-gray-500">
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
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                  {sub.content}
                </div>
              )}

              {sub.file_url && (
                <div className="mt-4">
                  <a
                    href={sub.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
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
                      disabled={!score}
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
