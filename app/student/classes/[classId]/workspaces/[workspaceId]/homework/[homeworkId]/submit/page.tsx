"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getHomeworkList, getSubmissions, saveSubmission } from "@/lib/store";
import { ArrowLeft, Upload, CheckCircle } from "lucide-react";
import Button from "@/app/components/ui/Button";
import FileUpload from "@/app/components/files/FileUpload";

export default function SubmitHomeworkPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const workspaceId = params.workspaceId as string;
  const homeworkId = params.homeworkId as string;
  const [homework, setHomework] = useState<any>(null);
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  useEffect(() => {
    const allHomework = getHomeworkList();
    const hw = allHomework.find((h) => h.id === homeworkId);
    setHomework(hw);

    const session = getSession();
    if (session) {
      const subs = getSubmissions(homeworkId, session.id);
      const sub = subs[0];
      if (sub) {
        setExistingSubmission(sub);
        setContent(sub.content || "");
      }
    }
  }, [homeworkId]);

  const handleFileUpload = (
    url: string,
    path: string,
    _size: number,
    _type: string
  ) => {
    setFileUrl(url);
    setFilePath(path);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const session = getSession();

    if (!session) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    if (!content && !fileUrl) {
      setError("Please add content or upload a file");
      setLoading(false);
      return;
    }

    if (existingSubmission) {
      const STORE_PREFIX = "tw_";
      const allSubs = getSubmissions();
      const idx = allSubs.findIndex((s) => s.id === existingSubmission.id);
      if (idx !== -1) {
        allSubs[idx].content = content || null;
        allSubs[idx].file_url = fileUrl;
        allSubs[idx].submitted_at = new Date().toISOString();
        localStorage.setItem(STORE_PREFIX + "submissions", JSON.stringify(allSubs));
      }
    } else {
      saveSubmission({
        homework_id: homeworkId,
        student_id: session.id,
        content: content || null,
        file_url: fileUrl,
      });
    }

    router.push(`/student/classes/${classId}/workspaces/${workspaceId}`);
  };

  if (!homework) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/student/classes/${classId}/workspaces/${workspaceId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {existingSubmission ? "Update Submission" : "Submit Homework"}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-1">{homework.title}</h3>
          {homework.description && (
            <p className="text-sm text-gray-600">{homework.description}</p>
          )}
          {homework.due_date && (
            <p className="text-sm text-gray-500 mt-2">
              Due: {new Date(homework.due_date).toLocaleDateString()}
            </p>
          )}
        </div>

        {existingSubmission && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              You have already submitted this homework. You can update your
              submission.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Write your answer here..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Upload a File
            </label>
            <FileUpload
              onUpload={handleFileUpload}
              onError={setError}
              folder={`submissions/${homeworkId}`}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href={`/student/classes/${classId}/workspaces/${workspaceId}`}
              className="flex-1"
            >
              <Button type="button" variant="outline" fullWidth>
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} fullWidth>
              {existingSubmission ? "Update Submission" : "Submit Homework"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
