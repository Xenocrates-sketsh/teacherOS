"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import ConversationList from "@/app/components/chat/ConversationList";
import ChatView from "@/app/components/chat/ChatView";

export default function StudentMessagesPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.conversationId as string | undefined;
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    setUserId(session.id);
    setLoading(false);
  }, [router]);

  if (loading || !userId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className={`w-80 border-r border-gray-100 flex flex-col ${
          conversationId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            userId={userId}
            onSelect={(id) => router.push(`/student/messages/${id}`)}
            selectedId={conversationId}
          />
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col ${
          !conversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {conversationId ? (
          <ChatView conversationId={conversationId} userId={userId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
