"use client";

import { useEffect, useState } from "react";
import { getSession, getUsers } from "@/lib/auth";
import { getStudentClasses, getClasses, getAttendanceSessions, getAttendanceRecords } from "@/lib/store";
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
    const session = getSession();
    if (!session) return;

    const enrollments = getStudentClasses(session.id);
    const allClasses = getClasses();

    const allRecords: AttendanceRecord[] = [];
    let present = 0, absent = 0, late = 0, excused = 0;

    for (const enrollment of enrollments) {
      const cls = allClasses.find((c) => c.id === enrollment.class_id);
      const sessions = getAttendanceSessions(enrollment.class_id);

      for (const sessionItem of sessions) {
        const records_list = getAttendanceRecords(sessionItem.id, session.id);
        const record = records_list[0];

        if (record) {
          allRecords.push({
            date: sessionItem.date,
            status: record.status,
            class_name: cls?.name || "Unknown",
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
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[#7b6b8d]">Loading attendance...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f8f4ff]">My Attendance</h1>
        <p className="mt-1 text-sm text-[#7b6b8d]">Your attendance record across all classes.</p>
      </div>

      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Present", count: stats.present, color: "text-green-600", bg: "bg-green-500/100/100/100/100/100/100/10", icon: CheckCircle },
            { label: "Absent", count: stats.absent, color: "text-red-600", bg: "bg-red-500/100/100/100/100/100/100/10", icon: XCircle },
            { label: "Late", count: stats.late, color: "text-yellow-600", bg: "bg-yellow-50", icon: Clock },
            { label: "Excused", count: stats.excused, color: "text-blue-600", bg: "bg-blue-50", icon: AlertTriangle },
          ].map((item) => {
            const percentage = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
            const Icon = item.icon;
            return (
              <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
                <Icon className={`w-6 h-6 ${item.color} mx-auto mb-1`} />
                <p className={`text-lg font-bold ${item.color}`}>{percentage}%</p>
                <p className="text-xs text-[#9d8ab5]">{item.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {records.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#f8f4ff] mb-2">No attendance records yet</h3>
          <p className="text-[#7b6b8d]">Your teacher hasn't marked any attendance sessions yet.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(212,175,55,0.08)]">
                <th className="text-left px-6 py-4 text-sm font-medium text-[#7b6b8d]">Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#7b6b8d]">Class</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#7b6b8d]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r, i) => (
                <tr key={i} className="hover:bg-[rgba(212,175,55,0.05)]">
                  <td className="px-6 py-4 text-sm text-[#f8f4ff]">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#9d8ab5]">{r.class_name}</td>
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
