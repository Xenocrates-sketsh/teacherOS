"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Clock, AlertTriangle, Calendar } from "lucide-react";

interface AttendanceRecord {
  date: string;
  status: string;
  class_name: string;
}

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, excused: 0, total: 0 });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: enrollments } = await supabase
      .from("student_classes")
      .select("class_id, classes!inner(id, name)")
      .eq("student_id", user.id);

    const allRecords: AttendanceRecord[] = [];
    let present = 0, absent = 0, late = 0, excused = 0;

    for (const enrollment of enrollments || []) {
      const { data: sessions } = await supabase
        .from("attendance_sessions")
        .select("id, date")
        .eq("class_id", enrollment.class_id);

      if (!sessions) continue;

      for (const session of sessions) {
        const { data: record } = await supabase
          .from("attendance_records")
          .select("status")
          .eq("session_id", session.id)
          .eq("student_id", user.id)
          .single();

        if (record) {
          allRecords.push({
            date: session.date,
            status: record.status,
            class_name: (enrollment.classes as any).name,
          });
          if (record.status === "present") present++;
          else if (record.status === "absent") absent++;
          else if (record.status === "late") late++;
          else if (record.status === "excused") excused++;
        }
      }
    }

    allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecords(allRecords);
    setStats({ present, absent, late, excused, total: allRecords.length });
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading attendance...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">Your attendance record across all classes.</p>
      </div>

      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Present", count: stats.present, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
            { label: "Absent", count: stats.absent, color: "text-red-600", bg: "bg-red-50", icon: XCircle },
            { label: "Late", count: stats.late, color: "text-yellow-600", bg: "bg-yellow-50", icon: Clock },
            { label: "Excused", count: stats.excused, color: "text-blue-600", bg: "bg-blue-50", icon: AlertTriangle },
          ].map((item) => {
            const percentage = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
            const Icon = item.icon;
            return (
              <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
                <Icon className={`w-6 h-6 ${item.color} mx-auto mb-1`} />
                <p className={`text-lg font-bold ${item.color}`}>{percentage}%</p>
                <p className="text-xs text-gray-600">{item.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records yet</h3>
          <p className="text-gray-500">Your teacher hasn't marked any attendance sessions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Class</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.class_name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.status === "present" ? "bg-green-100 text-green-700" :
                      r.status === "absent" ? "bg-red-100 text-red-700" :
                      r.status === "late" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {r.status === "present" ? <CheckCircle className="w-3 h-3" /> :
                       r.status === "absent" ? <XCircle className="w-3 h-3" /> :
                       r.status === "late" ? <Clock className="w-3 h-3" /> :
                       <AlertTriangle className="w-3 h-3" />}
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
