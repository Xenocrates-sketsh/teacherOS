"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

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
    const fetchData = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      // Get student profile
      const { data: studentProfile } = await supabase
        .from("student_profiles")
        .select("student_id, school_id")
        .eq("user_id", user.id)
        .single();

      // Get enrolled class
      const { data: enrollment } = await supabase
        .from("student_classes")
        .select("class_id, classes(name, schools(name))")
        .eq("student_id", user.id)
        .limit(1)
        .single();

      if (profile && studentProfile && enrollment) {
        setStudentData({
          full_name: profile.full_name,
          email: profile.email,
          student_id: studentProfile.student_id,
          school_name: (enrollment.classes as any).schools.name,
          class_name: (enrollment.classes as any).name,
        });
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading card...</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No Student Card
        </h1>
        <p className="text-gray-500">
          You need to be enrolled in a class to have a student card.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Student Card</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your digital student identification.
        </p>
      </div>

      {/* Student Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                className="h-12 w-12 text-gray-400"
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
              <p className="text-lg font-semibold text-gray-900">
                {studentData.full_name}
              </p>
              <p className="text-sm text-gray-500">{studentData.email}</p>
            </div>

            <div className="border-t pt-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Student ID</p>
                  <p className="font-medium text-gray-900 font-mono">
                    {studentData.student_id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">School</p>
                  <p className="font-medium text-gray-900">
                    {studentData.school_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-gray-500 text-sm">Class</p>
              <p className="font-medium text-gray-900">
                {studentData.class_name}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="mt-6 flex justify-center">
            <div className="bg-white p-2 border rounded-lg">
              <QRCodeSVG
                value={studentData.student_id}
                size={128}
                level="H"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-2">
            Scan for verification
          </p>
        </div>
      </div>

      {/* Print button */}
      <div className="mt-6">
        <button
          onClick={() => window.print()}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Print Card
        </button>
      </div>
    </div>
  );
}
