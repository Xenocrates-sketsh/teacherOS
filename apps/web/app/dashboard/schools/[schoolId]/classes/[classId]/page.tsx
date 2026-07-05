"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

interface Workspace {
  id: string;
  name: string;
  subject: string;
  created_at: string;
}

interface ClassCode {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export default function ClassDetailPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const [classData, setClassData] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get class info
      const { data: classInfo } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      // Get workspaces
      const { data: workspaceData } = await supabase
        .from("subject_workspaces")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

      // Get class codes
      const { data: codesData } = await supabase
        .from("class_codes")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

      // Get student count
      const { count } = await supabase
        .from("student_classes")
        .select("*", { count: "exact", head: true })
        .eq("class_id", classId);

      setClassData(classInfo);
      setWorkspaces(workspaceData || []);
      setClassCodes(codesData || []);
      setStudentCount(count || 0);
      setLoading(false);
    };

    fetchData();
  }, [classId]);

  const generateNewCode = async () => {
    const supabase = createClient();
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const { error } = await supabase.from("class_codes").insert({
      class_id: classId,
      code: code,
    });

    if (!error) {
      setClassCodes((prev) => [
        { id: crypto.randomUUID(), code, is_active: true, created_at: new Date().toISOString() },
        ...prev,
      ]);
    }
  };

  const toggleCodeActive = async (codeId: string, currentActive: boolean) => {
    const supabase = createClient();

    const { error } = await supabase
      .from("class_codes")
      .update({ is_active: !currentActive })
      .eq("id", codeId);

    if (!error) {
      setClassCodes((prev) =>
        prev.map((c) =>
          c.id === codeId ? { ...c, is_active: !currentActive } : c
        )
      );
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading class...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/schools/${schoolId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to School
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {classData?.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {studentCount} student{studentCount !== 1 ? "s" : ""} enrolled
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg
                className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span className="hidden sm:inline">Invite Students</span>
              <span className="sm:hidden">Invite</span>
            </button>
            <Link
              href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/new`}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg
                className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="hidden sm:inline">New Workspace</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75"
            onClick={() => setShowInvite(false)}
          />
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Invite Students
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Share this code or QR code with your students.
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Active codes */}
                  {classCodes
                    .filter((c) => c.is_active)
                    .map((classCode) => (
                      <div
                        key={classCode.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="font-mono text-2xl font-bold tracking-wider">
                            {classCode.code}
                          </div>
                          <button
                            onClick={() => copyCode(classCode.code)}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            {copied === classCode.code ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="flex justify-center mb-4">
                          <QRCodeSVG
                            value={classCode.code}
                            size={150}
                            level="H"
                          />
                        </div>
                        <div className="flex justify-center">
                          <button
                            onClick={() =>
                              toggleCodeActive(classCode.id, true)
                            }
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Deactivate
                          </button>
                        </div>
                      </div>
                    ))}

                  {/* Generate new code */}
                  <button
                    onClick={generateNewCode}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600"
                  >
                    + Generate New Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workspaces */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Subject Workspaces
        </h2>
        {workspaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No workspaces yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a workspace for a subject to get started.
            </p>
            <div className="mt-6">
              <Link
                href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Workspace
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspace.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {workspace.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {workspace.subject}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Class Codes Management */}
      {classCodes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Class Codes</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classCodes.map((classCode) => (
                  <tr key={classCode.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {classCode.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          classCode.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {classCode.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(classCode.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => copyCode(classCode.code)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() =>
                          toggleCodeActive(classCode.id, classCode.is_active)
                        }
                        className={`${
                          classCode.is_active
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {classCode.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
