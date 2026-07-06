"use client";

import { useEffect, useState } from "react";
import { getSession, getUsers } from "@/lib/auth";

export default function StudentSettingsPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setFullName(session.full_name);
      setEmail(session.email);
    }
    setLoading(false);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const session = getSession();
    if (!session) {
      setMessage({ type: "error", text: "Not authenticated" });
      setSaving(false);
      return;
    }

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === session.id);
    if (idx !== -1) {
      users[idx].full_name = fullName;
      localStorage.setItem("tw_users", JSON.stringify(users));
    }

    setMessage({ type: "success", text: "Profile updated successfully" });
    setSaving(false);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const newPassword = (e.target as HTMLFormElement).newPassword.value;
    const confirmPassword = (e.target as HTMLFormElement).confirmNewPassword.value;

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setSaving(false);
      return;
    }

    const session = getSession();
    if (session) {
      const users = getUsers();
      const idx = users.findIndex((u) => u.id === session.id);
      if (idx !== -1) {
        users[idx].password = newPassword;
        localStorage.setItem("tw_users", JSON.stringify(users));
      }
    }

    setMessage({ type: "success", text: "Password updated successfully" });
    (e.target as HTMLFormElement).reset();
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#7b6b8d]">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f8f4ff]">Settings</h1>
        <p className="mt-1 text-sm text-[#7b6b8d]">
          Manage your account settings.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-500/100/100/100/100/100/100/100/10 text-green-400"
              : "bg-red-500/100/100/100/100/100/100/10 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-[#f8f4ff] mb-4">
            Profile Information
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-[#cbd5e1]"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#cbd5e1]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="mt-1 block w-full border border-[rgba(212,175,55,0.1)] rounded-md shadow-sm py-2 px-3 bg-surface sm:text-sm"
              />
              <p className="mt-1 text-xs text-[#7b6b8d]">
                Email cannot be changed
              </p>
            </div>
            <div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-surface-card/80 backdrop-blur-xl shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-[#f8f4ff] mb-4">
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-[#cbd5e1]"
              >
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="mt-1 block w-full border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-[#cbd5e1]"
              >
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                required
                className="mt-1 block w-full border border-[rgba(212,175,55,0.15)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
