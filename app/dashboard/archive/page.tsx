"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Archive, RotateCcw } from "lucide-react";
import Button from "@/app/components/ui/Button";

interface ClassItem {
  id: string;
  name: string;
  school_name: string;
  school_id: string;
  archived: boolean;
  created_at: string;
}

export default function ArchivePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: schools } = await supabase
      .from("schools")
      .select("id, name");

    if (schools && schools.length > 0) {
      const schoolIds = schools.map((s) => s.id);
      const { data: classesData } = await supabase
        .from("classes")
        .select("id, name, school_id, archived, created_at")
        .in("school_id", schoolIds)
        .order("created_at", { ascending: false });

      setClasses(
        (classesData || []).map((c) => ({
          id: c.id,
          name: c.name,
          school_name: schools.find((s) => s.id === c.school_id)?.name || "Unknown",
          school_id: c.school_id,
          archived: c.archived || false,
          created_at: c.created_at,
        }))
      );
    }
    setLoading(false);
  };

  const toggleArchive = async (classId: string, currentArchived: boolean) => {
    setToggling(classId);
    const supabase = createClient();
    await supabase
      .from("classes")
      .update({ archived: !currentArchived })
      .eq("id", classId);
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, archived: !currentArchived } : c
      )
    );
    setToggling(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading archive...</div>
      </div>
    );
  }

  const archivedClasses = classes.filter((c) => c.archived);
  const activeClasses = classes.filter((c) => !c.archived);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
        <p className="mt-1 text-sm text-gray-500">
          Archive classes at the end of a semester or school year. Archived classes are hidden from the main dashboard.
        </p>
      </div>

      {activeClasses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Classes</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeClasses.map((cls) => (
                  <tr key={cls.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.school_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cls.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={toggling === cls.id}
                        onClick={() => toggleArchive(cls.id, false)}
                      >
                        <Archive className="w-4 h-4 mr-1" />
                        Archive
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Archived Classes ({archivedClasses.length})
        </h2>
        {archivedClasses.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nothing archived yet</h3>
            <p className="text-gray-500">
              Archive classes from the class settings or here when you're done with them.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {archivedClasses.map((cls) => (
                  <tr key={cls.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.school_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cls.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={toggling === cls.id}
                        onClick={() => toggleArchive(cls.id, true)}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restore
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
