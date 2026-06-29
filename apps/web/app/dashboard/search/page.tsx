"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  type: "lesson" | "homework" | "announcement" | "resource";
  title: string;
  content: string;
  workspace_name: string;
  class_name: string;
  created_at: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    const supabase = createClient();
    const searchQuery = `%${query}%`;

    // Search lessons
    const { data: lessons } = await supabase
      .from("lessons")
      .select(
        "id, title, content, created_at, subject_workspaces!inner(name, classes!inner(name))"
      )
      .or(`title.ilike.${searchQuery},content.ilike.${searchQuery}`);

    // Search homework
    const { data: homework } = await supabase
      .from("homework")
      .select(
        "id, title, description, created_at, subject_workspaces!inner(name, classes!inner(name))"
      )
      .or(`title.ilike.${searchQuery},description.ilike.${searchQuery}`);

    // Search announcements
    const { data: announcements } = await supabase
      .from("announcements")
      .select(
        "id, title, content, created_at, subject_workspaces!inner(name, classes!inner(name))"
      )
      .or(`title.ilike.${searchQuery},content.ilike.${searchQuery}`);

    // Search resources
    const { data: resources } = await supabase
      .from("resources")
      .select(
        "id, title, type, created_at, subject_workspaces!inner(name, classes!inner(name))"
      )
      .ilike("title", searchQuery);

    // Combine and format results
    const allResults: SearchResult[] = [
      ...(lessons || []).map((l) => ({
        id: l.id,
        type: "lesson" as const,
        title: l.title,
        content: l.content || "",
        workspace_name: (l.subject_workspaces as any).name,
        class_name: (l.subject_workspaces as any).classes.name,
        created_at: l.created_at,
      })),
      ...(homework || []).map((h) => ({
        id: h.id,
        type: "homework" as const,
        title: h.title,
        content: h.description || "",
        workspace_name: (h.subject_workspaces as any).name,
        class_name: (h.subject_workspaces as any).classes.name,
        created_at: h.created_at,
      })),
      ...(announcements || []).map((a) => ({
        id: a.id,
        type: "announcement" as const,
        title: a.title,
        content: a.content || "",
        workspace_name: (a.subject_workspaces as any).name,
        class_name: (a.subject_workspaces as any).classes.name,
        created_at: a.created_at,
      })),
      ...(resources || []).map((r) => ({
        id: r.id,
        type: "resource" as const,
        title: r.title,
        content: r.type === "file" ? "File upload" : "External link",
        workspace_name: (r.subject_workspaces as any).name,
        class_name: (r.subject_workspaces as any).classes.name,
        created_at: r.created_at,
      })),
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setResults(allResults);
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "homework":
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case "announcement":
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      case "resource":
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search across all your lessons, homework, announcements, and resources.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for content..."
              className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>

          {results.length === 0 ? (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No results found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {result.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {result.type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {result.content}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>{result.class_name}</span>
                        <span className="mx-2">·</span>
                        <span>{result.workspace_name}</span>
                        <span className="mx-2">·</span>
                        <span>
                          {new Date(result.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
