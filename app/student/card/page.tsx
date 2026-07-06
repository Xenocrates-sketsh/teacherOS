"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getSession, getUsers } from "@/lib/auth";
import { getStudentClasses, getClasses } from "@/lib/store";

interface StudentData {
  full_name: string;
  email: string;
  student_id: string;
  school_name: string;
  class_name: string;
}

export default function StudentCardPage() {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (!session) return;

    const enrollments = getStudentClasses(session.id);
    const allClasses = getClasses();

    const enrolledClass = enrollments.length > 0
      ? allClasses.find((c) => c.id === enrollments[0].class_id)
      : null;

    if (session && enrolledClass) {
      setStudentData({
        full_name: session.full_name,
        email: session.email,
        student_id: session.id,
        school_name: "School",
        class_name: enrolledClass.name,
      });
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#7b6b8d]">Loading card...</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-[#f8f4ff] mb-4">
          No Student Card
        </h1>
        <p className="text-[#7b6b8d]">
          You need to be enrolled in a class to have a student card.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f8f4ff]">My Student Card</h1>
        <p className="mt-1 text-sm text-[#7b6b8d]">
          Your digital student identification.
        </p>
      </div>

      {/* Student Card */}
      <div className="bg-surface-card/80 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white text-center">
            Student ID Card
          </h2>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Photo placeholder */}
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="h-12 w-12 text-[#6b5b7d]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>

          {/* Student Info */}
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-lg font-semibold text-[#f8f4ff]">
                {studentData.full_name}
              </p>
              <p className="text-sm text-[#7b6b8d]">{studentData.email}</p>
            </div>

            <div className="border-t pt-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#7b6b8d]">Student ID</p>
                  <p className="font-medium text-[#f8f4ff] font-mono">
                    {studentData.student_id}
                  </p>
                </div>
                <div>
                  <p className="text-[#7b6b8d]">School</p>
                  <p className="font-medium text-[#f8f4ff]">
                    {studentData.school_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-[#7b6b8d] text-sm">Class</p>
              <p className="font-medium text-[#f8f4ff]">
                {studentData.class_name}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="mt-6 flex justify-center">
            <div className="bg-surface-card/80 backdrop-blur-xl p-2 border rounded-lg">
              <QRCodeSVG
                value={studentData.student_id}
                size={128}
                level="H"
              />
            </div>
          </div>

          <p className="text-xs text-[#6b5b7d] text-center mt-2">
            Scan for verification
          </p>
        </div>
      </div>

      {/* Print button */}
      <div className="mt-6">
        <button
          onClick={() => window.print()}
          className="w-full flex justify-center py-2 px-4 border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm text-sm font-medium text-[#cbd5e1] bg-surface-card/80 backdrop-blur-xl hover:bg-[rgba(212,175,55,0.05)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
        >
          Print Card
        </button>
      </div>
    </div>
  );
}
