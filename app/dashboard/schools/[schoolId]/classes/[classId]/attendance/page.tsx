"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getClasses, getAttendanceSessions, saveAttendanceSession, getAttendanceRecords, getStudentClasses } from "@/lib/store";
import { ArrowLeft, Plus, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import Button from "@/app/components/ui/Button";

interface Session {
  id: string;
  date: string;
  created_at: string;
  total_present: number;
  total_absent: number;
  total_late: number;
  total_excused: number;
  total_students: number;
}

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const classes = getClasses();
    const classData = classes.find((c) => c.id === classId);
    if (classData) setClassName(classData.name);

    const sessionsData = getAttendanceSessions(classId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const enrollments = getStudentClasses(undefined, classId);
    const totalStudents = enrollments.length;

    const enriched: Session[] = sessionsData.map((session) => {
      const records = getAttendanceRecords(session.id);
      return {
        id: session.id,
        date: session.date,
        created_at: session.created_at,
        total_present: records.filter((r) => r.status === "present").length,
        total_absent: records.filter((r) => r.status === "absent").length,
        total_late: records.filter((r) => r.status === "late").length,
        total_excused: records.filter((r) => r.status === "excused").length,
        total_students: totalStudents,
      };
    });

    setSessions(enriched);
    setLoading(false);
  }, [classId]);

  const startNewSession = () => {
    setCreating(true);
    const session = getSession();
    if (!session) return;

    const today = new Date().toISOString().split("T")[0];
    const existing = getAttendanceSessions(classId).find(
      (s) => s.date === today
    );

    if (existing) {
      router.push(`/dashboard/schools/${schoolId}/classes/${classId}/attendance/${existing.id}`);
      return;
    }

    const newSession = saveAttendanceSession({
      class_id: classId,
      date: today,
      created_by: session.id,
    });

    router.push(`/dashboard/schools/${schoolId}/classes/${classId}/attendance/${newSession.id}`);
    setCreating(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading attendance...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/schools/${schoolId}/classes/${classId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {className}
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <Button loading={creating} onClick={startNewSession}>
            <Plus className="w-4 h-4 mr-1" />
            Take Attendance
          </Button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance sessions yet</h3>
          <p className="text-gray-500">Start taking attendance for today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const marked = session.total_present + session.total_absent + session.total_late + session.total_excused;
            const completion = session.total_students > 0 ? Math.round((marked / session.total_students) * 100) : 0;
            return (
              <Link
                key={session.id}
                href={`/dashboard/schools/${schoolId}/classes/${classId}/attendance/${session.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{new Date(session.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                    <p className="text-sm text-gray-500 mt-1">{marked} of {session.total_students} marked ({completion}%)</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" />{session.total_present}</span>
                    <span className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" />{session.total_absent}</span>
                    <span className="flex items-center gap-1 text-yellow-600"><Clock className="w-4 h-4" />{session.total_late}</span>
                    <span className="flex items-center gap-1 text-blue-600"><AlertTriangle className="w-4 h-4" />{session.total_excused}</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${completion}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
