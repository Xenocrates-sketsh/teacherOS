"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, Save } from "lucide-react";
import Button from "@/app/components/ui/Button";

interface StudentRecord {
  student_id: string;
  full_name: string;
  status: "present" | "absent" | "late" | "excused" | null;
}

export default function AttendanceSessionPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<any>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    const supabase = createClient();

    const { data: sessionData } = await supabase
      .from("attendance_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
    setSession(sessionData);

    const { data: enrollments } = await supabase
      .from("student_classes")
      .select("student_id, users!student_classes_student_id_fkey(full_name)")
      .eq("class_id", classId);

    const { data: existingRecords } = await supabase
      .from("attendance_records")
      .select("student_id, status")
      .eq("session_id", sessionId);

    const recordMap: Record<string, string> = {};
    for (const r of existingRecords || []) {
      recordMap[r.student_id] = r.status;
    }

    const studentList: StudentRecord[] = (enrollments || []).map((e: any) => ({
      student_id: e.student_id,
      full_name: e.users?.full_name || "Unknown",
      status: (recordMap[e.student_id] as any) || null,
    }));

    setStudents(studentList);
    setLoading(false);
  };

  const setStatus = (studentId: string, status: "present" | "absent" | "late" | "excused") => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, status } : s))
    );
  };

  const saveAttendance = async () => {
    setSaving(true);
    const supabase = createClient();
    const records = students.filter((s) => s.status);

    for (const record of records) {
      const { error } = await supabase.from("attendance_records").upsert(
        {
          session_id: sessionId,
          student_id: record.student_id,
          status: record.status,
        },
        { onConflict: "session_id,student_id" }
      );
      if (error) console.error(error);
    }

    setSaving(false);
  };

  const statusColors = {
    present: { bg: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    absent: { bg: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    late: { bg: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
    excused: { bg: "bg-blue-100 text-blue-700 border-blue-200", icon: AlertTriangle },
  } as const;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>;
  }

  const markedCount = students.filter((s) => s.status).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/schools/${schoolId}/classes/${classId}/attendance`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Attendance
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {session?.date ? new Date(session.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Attendance"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {markedCount} of {students.length} marked
            </p>
          </div>
          <Button loading={saving} onClick={saveAttendance}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-2 flex-wrap">
          {(["present", "absent", "late", "excused"] as const).map((status) => {
            const Icon = statusColors[status].icon;
            return (
              <button
                key={status}
                onClick={() => {
                  const allSame = students.every((s) => s.status === status);
                  setStudents((prev) =>
                    prev.map((s) => ({
                      ...s,
                      status: allSame ? null : status,
                    }))
                  );
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${statusColors[status].bg}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-gray-100">
          {students.map((student) => (
            <div key={student.student_id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                  {student.full_name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900">{student.full_name}</span>
              </div>
              <div className="flex gap-1">
                {(["present", "absent", "late", "excused"] as const).map((status) => {
                  const active = student.status === status;
                  const colors = statusColors[status];
                  return (
                    <button
                      key={status}
                      onClick={() => setStatus(student.student_id, status)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        active
                          ? colors.bg
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {status === "present" ? "P" : status === "absent" ? "A" : status === "late" ? "L" : "E"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
