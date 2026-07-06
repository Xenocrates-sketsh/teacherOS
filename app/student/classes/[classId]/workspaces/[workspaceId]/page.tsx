"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getWorkspaces, getLessons, getHomeworkList, getAnnouncements } from "@/lib/store";

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
    const workspaces = getWorkspaces();
    const workspaceData = workspaces.find((w) => w.id === workspaceId);

    const lessonsData = getLessons(workspaceId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const homeworkData = getHomeworkList(workspaceId)
      .sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });

    const announcementsData = getAnnouncements(workspaceId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setWorkspace(workspaceData);
    setLessons(lessonsData);
    setHomework(homeworkData);
    setAnnouncements(announcementsData);
    setResources([]);
    setLoading(false);
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#7b6b8d]">Loading workspace...</div>
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
          className="text-sm text-[#7b6b8d] hover:text-[#cbd5e1]"
        >
          ← Back to Class
        </Link>
        <h1 className="text-2xl font-bold text-[#f8f4ff] mt-2">
          {workspace?.name}
        </h1>
        <p className="mt-1 text-sm text-[#7b6b8d]">{workspace?.subject}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[rgba(212,175,55,0.1)] mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-gold-500 text-gold-400"
                  : "border-transparent text-[#7b6b8d] hover:text-[#cbd5e1] hover:border-[rgba(212,175,55,0.15)]"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-[rgba(212,175,55,0.15)] text-gold-400"
                      : "bg-surface-card text-[#9d8ab5]"
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
              <div className="bg-surface-card/80 backdrop-blur-xl rounded-lg shadow p-8 text-center">
                <p className="text-sm text-[#7b6b8d]">No lessons yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-surface-card/80 backdrop-blur-xl rounded-lg shadow p-6"
                  >
                    <h3 className="text-lg font-medium text-[#f8f4ff]">
                      {lesson.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#9d8ab5] whitespace-pre-wrap">
                      {lesson.content}
                    </p>
                    <p className="mt-4 text-xs text-[#6b5b7d]">
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
              <div className="bg-surface-card/80 backdrop-blur-xl rounded-lg shadow p-8 text-center">
                <p className="text-sm text-[#7b6b8d]">No homework yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {homework.map((hw) => (
                  <div
                    key={hw.id}
                    className="bg-surface-card/80 backdrop-blur-xl rounded-lg shadow p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-[#f8f4ff]">
                          {hw.title}
                        </h3>
                        <p className="mt-2 text-sm text-[#9d8ab5] whitespace-pre-wrap">
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
                    <p className="mt-4 text-xs text-[#6b5b7d]">
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
              <div className="bg-surface-card/80 backdrop-blur-xl rounded-lg shadow p-8 text-center">
                <p className="text-sm text-[#7b6b8d]">No announcements yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-surface-card/80 backdrop-blur-xl rounded-lg shadow p-6"
                  >
                    <h3 className="text-lg font-medium text-[#f8f4ff]">
                      {announcement.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#9d8ab5] whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <p className="mt-4 text-xs text-[#6b5b7d]">
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
              <div className="bg-surface-card/80 backdrop-blur-xl rounded-lg shadow p-8 text-center">
                <p className="text-sm text-[#7b6b8d]">No resources yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-surface-card/80 backdrop-blur-xl rounded-lg shadow p-6"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {resource.type === "file" ? (
                          <svg
                            className="h-8 w-8 text-[#6b5b7d]"
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
                            className="h-8 w-8 text-[#6b5b7d]"
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
                        <h3 className="text-lg font-medium text-[#f8f4ff]">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-[#7b6b8d] capitalize">
                          {resource.type === "file" ? "File" : "Link"}
                        </p>
                      </div>
                      <div className="ml-4">
                        {resource.type === "file" && resource.file_url ? (
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-[rgba(212,175,55,0.15)] shadow-sm text-sm font-medium rounded-md text-[#cbd5e1] bg-surface-card/80 backdrop-blur-xl hover:bg-[rgba(212,175,55,0.05)]"
                          >
                            Download
                          </a>
                        ) : resource.type === "link" && resource.link_url ? (
                          <a
                            href={resource.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-[rgba(212,175,55,0.15)] shadow-sm text-sm font-medium rounded-md text-[#cbd5e1] bg-surface-card/80 backdrop-blur-xl hover:bg-[rgba(212,175,55,0.05)]"
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
