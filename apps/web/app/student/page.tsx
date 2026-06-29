"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function StudentPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!profile || profile.role !== "student") {
        window.location.href = "/login";
        return;
      }

      setUser(profile);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome, {user?.full_name}
      </h1>
      <p className="text-gray-600 mb-8">Your student dashboard</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/student/join"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900">Join Class</h2>
          <p className="text-sm text-gray-500">Enter a class code</p>
        </Link>
        <Link
          href="/student/card"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900">My Card</h2>
          <p className="text-sm text-gray-500">View student ID</p>
        </Link>
        <Link
          href="/student/settings"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500">Account settings</p>
        </Link>
      </div>
    </div>
  );
}
