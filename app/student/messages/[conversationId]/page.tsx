"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import ConversationList from "@/app/components/chat/ConversationList";
import ChatView from "@/app/components/chat/ChatView";

export default function StudentConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
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
        <div className="text-[#7b6b8d]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] glass-card overflow-hidden">
      <div className="w-80 border-r border-[rgba(212,175,55,0.08)] flex flex-col hidden md:flex">
        <div className="p-4 border-b border-[rgba(212,175,55,0.08)]">
          <h2 className="text-lg font-semibold text-[#f8f4ff]">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            userId={userId}
            onSelect={(id) => router.push(`/student/messages/${id}`)}
            selectedId={conversationId}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <ChatView conversationId={conversationId} userId={userId} />
      </div>
    </div>
  );
}
