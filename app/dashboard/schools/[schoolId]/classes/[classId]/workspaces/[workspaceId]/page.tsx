"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getWorkspaces, getLessons, getHomeworkList, getAnnouncements, getSubmissions, getGrades, getStudentClasses } from "@/lib/store";
import GradeDistribution from "@/app/components/charts/GradeDistribution";

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

export default function WorkspaceDetailPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const workspaceId = params.workspaceId as string;
  const [workspace, setWorkspace] = useState<any>(null);
  const [lessons, setLessons] = useState<Content[]>([]);
  const [homework, setHomework] = useState<Content[]>([]);
  const [announcements, setAnnouncements] = useState<Content[]>([]);
  const [resources, setResources] = useState<Content[]>([]);
  const [activeTab, setActiveTab] = useState<"lessons" | "homework" | "announcements" | "resources">("lessons");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHomework: 0,
    totalSubmissions: 0,
    avgScore: null as number | null,
    submissionRate: 0,
  });

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

    // Calculate stats
    const hwIds = homeworkData.map((h) => h.id);
    let totalSubs = 0;
    let totalScore = 0;
    let gradedCount = 0;

    if (hwIds.length > 0) {
      for (const hwId of hwIds) {
        const subs = getSubmissions(hwId);
        totalSubs += subs.length;

        for (const sub of subs) {
          const g = getGrades(sub.id);
          const grade = g[0];
          if (grade) {
            totalScore += (grade.score / grade.max_score) * 100;
            gradedCount++;
          }
        }
      }
    }

    const enrollments = getStudentClasses(undefined, classId);
    const studentCount = enrollments.length;
    const totalPossible = homeworkData.length * studentCount;

    setStats({
      totalHomework: homeworkData.length,
      totalSubmissions: totalSubs,
      avgScore: gradedCount > 0 ? Math.round(totalScore / gradedCount) : null,
      submissionRate: totalPossible > 0 ? Math.round((totalSubs / totalPossible) * 100) : 0,
    });

    setLoading(false);
  }, [workspaceId, classId]);

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
          href={`/dashboard/schools/${schoolId}/classes/${classId}`}
          className="text-sm text-[#7b6b8d] hover:text-[#cbd5e1]"
        >
          ← Back to Class
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-[#f8f4ff]">
              {workspace?.name}
            </h1>
            <p className="mt-1 text-sm text-[#7b6b8d]">{workspace?.subject}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats.totalHomework > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-surface-card/80 backdrop-blur-xl rounded-xl border border-[rgba(212,175,55,0.08)] p-4 text-center">
            <p className="text-2xl font-bold text-[#f8f4ff]">{stats.submissionRate}%</p>
            <p className="text-xs text-[#7b6b8d] mt-1">Submission Rate</p>
            <div className="mt-2 w-full bg-surface-card rounded-full h-1.5">
              <div className="bg-gradient-to-br from-gold-500 to-gold-400 h-1.5 rounded-full" style={{ width: `${stats.submissionRate}%` }} />
            </div>
          </div>
          <div className="bg-surface-card/80 backdrop-blur-xl rounded-xl border border-[rgba(212,175,55,0.08)] p-4 text-center">
            <p className="text-2xl font-bold text-[#f8f4ff]">{stats.avgScore !== null ? `${stats.avgScore}%` : "—"}</p>
            <p className="text-xs text-[#7b6b8d] mt-1">Average Score</p>
            {stats.avgScore !== null && (
              <div className="mt-2 w-full bg-surface-card rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${
                  stats.avgScore >= 70 ? "bg-green-500/100/100/100/100/100/100/100" : stats.avgScore >= 50 ? "bg-yellow-500" : "bg-red-500/100/100/100/100/100/100/100"
                }`} style={{ width: `${stats.avgScore}%` }} />
              </div>
            )}
          </div>
          <div className="bg-surface-card/80 backdrop-blur-xl rounded-xl border border-[rgba(212,175,55,0.08)] p-4 text-center">
            <p className="text-2xl font-bold text-[#f8f4ff]">{stats.totalHomework}</p>
            <p className="text-xs text-[#7b6b8d] mt-1">Total Homework</p>
          </div>
        </div>
      )}

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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#f8f4ff]">Lessons</h3>
              <Link
                href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}/lessons/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-gold"
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
                New Lesson
              </Link>
            </div>
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
                    <h4 className="text-lg font-medium text-[#f8f4ff]">
                      {lesson.title}
                    </h4>
                    <p className="mt-2 text-sm text-[#9d8ab5] whitespace-pre-wrap line-clamp-3">
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#f8f4ff]">Homework</h3>
              <Link
                href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}/homework/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-gold"
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
                New Homework
              </Link>
            </div>
            {homework.length > 0 && (
              <div className="glass-card p-5 mb-6">
                <GradeDistribution
                  ranges={[
                    { label: "90-100%", count: 0, color: "bg-green-500/100/100/100/100/100/100/100" },
                    { label: "70-89%", count: 0, color: "bg-blue-500" },
                    { label: "50-69%", count: 0, color: "bg-yellow-500" },
                    { label: "0-49%", count: 0, color: "bg-red-500/100/100/100/100/100/100/100" },
                  ]}
                  total={0}
                />
              </div>
            )}

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
                        <h4 className="text-lg font-medium text-[#f8f4ff]">
                          {hw.title}
                        </h4>
                        <p className="mt-2 text-sm text-[#9d8ab5] whitespace-pre-wrap">
                          {hw.description}
                        </p>
                      </div>
                      {hw.due_date && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            new Date(hw.due_date) < new Date()
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          Due {new Date(hw.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-xs text-[#6b5b7d]">
                      Posted {new Date(hw.created_at).toLocaleDateString()}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#f8f4ff]">Announcements</h3>
              <Link
                href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}/announcements/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-gold"
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
                New Announcement
              </Link>
            </div>
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
                    <h4 className="text-lg font-medium text-[#f8f4ff]">
                      {announcement.title}
                    </h4>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#f8f4ff]">Resources</h3>
              <Link
                href={`/dashboard/schools/${schoolId}/classes/${classId}/workspaces/${workspaceId}/resources/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-gold"
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
                New Resource
              </Link>
            </div>
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
                        <h4 className="text-lg font-medium text-[#f8f4ff]">
                          {resource.title}
                        </h4>
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
