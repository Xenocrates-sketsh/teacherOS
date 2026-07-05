"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    const { error: resourceError } = await supabase.from("resources").insert({
      title: title,
      type: type,
      file_url: type === "file" ? fileUrl : null,
      link_url: type === "link" ? linkUrl : null,
      storage_path: type === "file" ? filePath : null,
      file_size: type === "file" ? fileSize : null,
      mime_type: type === "file" ? fileMimeType : null,
      workspace_id: workspaceId,
      created_by: user.id,
    });

    if (resourceError) {
      setError("Failed to create resource");
      setLoading(false);
      return;
    }

    router.push(
      `/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}`
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Resource</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Chapter 5 Notes"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType("link")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  type === "link"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
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
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
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
