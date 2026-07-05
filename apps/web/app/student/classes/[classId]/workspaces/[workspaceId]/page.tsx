"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Content {
  id: string;
  title: string;
  content: string;
  due_date?: string;
  type?: string;
  file_url?: string;
  link_url?: string;
  created_at: string;
}

export default function StudentWorkspacePage() {
  const params = useParams();
  const classId = params.classId as string;
  const workspaceId = params.workspaceId as string;
  const [workspace, setWorkspace] = useState<any>(null);
  const [lessons, setLessons] = useState<Content[]>([]);
  const [homework, setHomework] = useState<Content[]>([]);
  const [announcements, setAnnouncements] = useState<Content[]>([]);
  const [resources, setResources] = useState<Content[]>([]);
  const [activeTab, setActiveTab] = useState<"lessons" | "homework" | "announcements" | "resources">("lessons");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get workspace info
      const { data: workspaceData } = await supabase
        .from("subject_workspaces")
        .select("name, subject, classes(name)")
        .eq("id", workspaceId)
        .single();

      // Get lessons
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("id, title, content, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      // Get homework
      const { data: homeworkData } = await supabase
        .from("homework")
        .select("id, title, description, due_date, created_at")
        .eq("workspace_id", workspaceId)
        .order("due_date", { ascending: true });

      // Get announcements
      const { data: announcementsData } = await supabase
        .from("announcements")
        .select("id, title, content, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      // Get resources
      const { data: resourcesData } = await supabase
        .from("resources")
        .select("id, title, type, file_url, link_url, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      setWorkspace(workspaceData);
      setLessons(lessonsData || []);
      setHomework(homeworkData || []);
      setAnnouncements(announcementsData || []);
      setResources(resourcesData || []);
      setLoading(false);
    };

    fetchData();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading workspace...</div>
      </div>
    );
  }

  const tabs = [
    { id: "lessons" as const, label: "Lessons", count: lessons.length },
    { id: "homework" as const, label: "Homework", count: homework.length },
    { id: "announcements" as const, label: "Announcements", count: announcements.length },
    { id: "resources" as const, label: "Resources", count: resources.length },
  ];

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/student/classes/${classId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to {workspace?.classes?.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {workspace?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{workspace?.subject}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {/* Lessons Tab */}
        {activeTab === "lessons" && (
          <div>
            {lessons.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-sm text-gray-500">No lessons yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <h3 className="text-lg font-medium text-gray-900">
                      {lesson.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                      {lesson.content}
                    </p>
                    <p className="mt-4 text-xs text-gray-400">
                      {new Date(lesson.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Homework Tab */}
        {activeTab === "homework" && (
          <div>
            {homework.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-sm text-gray-500">No homework yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {homework.map((hw) => (
                  <div
                    key={hw.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {hw.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                          {hw.description}
                        </p>
                      </div>
                      {hw.due_date && (
                        <div className="ml-4 flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              new Date(hw.due_date) < new Date()
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            Due{" "}
                            {new Date(hw.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-xs text-gray-400">
                      Posted{" "}
                      {new Date(hw.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div>
            {announcements.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-sm text-gray-500">No announcements yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <h3 className="text-lg font-medium text-gray-900">
                      {announcement.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <p className="mt-4 text-xs text-gray-400">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div>
            {resources.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-sm text-gray-500">No resources yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {resource.type === "file" ? (
                          <svg
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {resource.type === "file" ? "File" : "Link"}
                        </p>
                      </div>
                      <div className="ml-4">
                        {resource.type === "file" && resource.file_url ? (
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Download
                          </a>
                        ) : resource.type === "link" && resource.link_url ? (
                          <a
                            href={resource.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Open Link
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
