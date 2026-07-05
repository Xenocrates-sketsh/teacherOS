"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getLessons, getHomeworkList, getAnnouncements } from "@/lib/store";
import { Search, BookOpen, ClipboardList, Megaphone, FileText, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  type: "lesson" | "homework" | "announcement";
  title: string;
  content: string;
  created_at: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    const q = searchQuery.toLowerCase();

    const lessons = getLessons().filter(
      (l) => l.title.toLowerCase().includes(q) || l.content.toLowerCase().includes(q)
    );

    const homework = getHomeworkList().filter(
      (h) => h.title.toLowerCase().includes(q) || h.description.toLowerCase().includes(q)
    );

    const announcements = getAnnouncements().filter(
      (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    );

    const allResults: SearchResult[] = [
      ...lessons.map((l) => ({
        id: l.id,
        type: "lesson" as const,
        title: l.title,
        content: l.content || "",
        created_at: l.created_at,
      })),
      ...homework.map((h) => ({
        id: h.id,
        type: "homework" as const,
        title: h.title,
        content: h.description || "",
        created_at: h.created_at,
      })),
      ...announcements.map((a) => ({
        id: a.id,
        type: "announcement" as const,
        title: a.title,
        content: a.content || "",
        created_at: a.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setResults(allResults);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, performSearch]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, { icon: typeof BookOpen; color: string }> = {
      lesson: { icon: BookOpen, color: "text-blue-500" },
      homework: { icon: ClipboardList, color: "text-yellow-500" },
      announcement: { icon: Megaphone, color: "text-green-500" },
      resource: { icon: FileText, color: "text-purple-500" },
    };
    const Icon = icons[type]?.icon || FileText;
    return <Icon className={`h-5 w-5 ${icons[type]?.color || "text-gray-500"}`} />;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search across all your lessons, homework, announcements, and resources.
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Start typing to search..."
          className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {searched && (
        <div>
          {results.length > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
          )}

          {results.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">{getTypeIcon(result.type)}</div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{result.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {result.type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{result.content}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>{new Date(result.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-200" />
          <h3 className="mt-2 text-sm font-medium text-gray-500">Type something to search</h3>
        </div>
      )}
    </div>
  );
}
