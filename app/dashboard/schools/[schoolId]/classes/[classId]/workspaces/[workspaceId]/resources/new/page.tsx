"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import FileUpload from "@/app/components/files/FileUpload";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import { Link2, Upload, ArrowLeft } from "lucide-react";

export default function NewResourcePage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const workspaceId = params.workspaceId as string;
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"file" | "link">("link");
  const [linkUrl, setLinkUrl] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (
    url: string,
    path: string,
    size: number,
    mimeType: string
  ) => {
    setFileUrl(url);
    setFilePath(path);
    setFileSize(size);
    setFileMimeType(mimeType);
    setError(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const session = getSession();

    if (!session) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    if (type === "link" && !linkUrl) {
      setError("Please enter a URL");
      setLoading(false);
      return;
    }

    if (type === "file" && !fileUrl) {
      setError("Please upload a file");
      setLoading(false);
      return;
    }

    const resources = JSON.parse(localStorage.getItem("tw_resources") || "[]");
    resources.push({
      id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
      title,
      type,
      file_url: type === "file" ? fileUrl : null,
      link_url: type === "link" ? linkUrl : null,
      storage_path: type === "file" ? filePath : null,
      file_size: type === "file" ? fileSize : null,
      mime_type: type === "file" ? fileMimeType : null,
      workspace_id: workspaceId,
      created_by: session.id,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem("tw_resources", JSON.stringify(resources));

    router.push(
      `/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}`
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}`}
          className="inline-flex items-center gap-1 text-sm text-[#7b6b8d] hover:text-[#cbd5e1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        <h1 className="text-2xl font-bold text-[#f8f4ff] mt-2">New Resource</h1>
      </div>

      <div className="glass-card">
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Chapter 5 Notes"
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
              Resource Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType("link")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  type === "link"
                    ? "border-gold-500 bg-[rgba(124,58,237,0.1)] text-gold-400"
                    : "border-[rgba(212,175,55,0.1)] text-[#9d8ab5] hover:border-[rgba(212,175,55,0.15)]"
                }`}
              >
                <Link2 className="w-4 h-4" />
                Link
              </button>
              <button
                type="button"
                onClick={() => setType("file")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  type === "file"
                    ? "border-gold-500 bg-[rgba(124,58,237,0.1)] text-gold-400"
                    : "border-[rgba(212,175,55,0.1)] text-[#9d8ab5] hover:border-[rgba(212,175,55,0.15)]"
                }`}
              >
                <Upload className="w-4 h-4" />
                File
              </button>
            </div>
          </div>

          {type === "link" ? (
            <Input
              label="URL"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/resource"
              required
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                Upload File
              </label>
              <FileUpload
                onUpload={handleFileUpload}
                onError={setError}
                folder={`resources/${workspaceId}`}
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-500/100/100/100/100/100/100/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}`}
              className="flex-1"
            >
              <Button type="button" variant="outline" fullWidth>
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} fullWidth>
              Create Resource
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
