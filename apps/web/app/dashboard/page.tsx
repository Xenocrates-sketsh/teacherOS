"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
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

      if (!profile || profile.role !== "teacher") {
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
      <p className="text-gray-600 mb-8">Your teacher dashboard</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/schools"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900">My Schools</h2>
          <p className="text-sm text-gray-500">Manage your schools</p>
        </Link>
        <Link
          href="/dashboard/search"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900">Search</h2>
          <p className="text-sm text-gray-500">Find content</p>
        </Link>
        <Link
          href="/dashboard/archive"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900">Archive</h2>
          <p className="text-sm text-gray-500">Archived classes</p>
        </Link>
        <Link
          href="/dashboard/settings"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500">Account settings</p>
        </Link>
      </div>
    </div>
  );
}
