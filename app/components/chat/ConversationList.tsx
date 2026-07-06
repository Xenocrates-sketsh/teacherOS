"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/lib/auth";
import { getConversations, getMessages } from "@/lib/store";
import Avatar from "@/app/components/ui/Avatar";
import Badge from "@/app/components/ui/Badge";

interface Conversation {
  id: string;
  name: string | null;
  type: string;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  other_user: {
    id: string;
    full_name: string;
  } | null;
}

interface ConversationListProps {
  userId: string;
  onSelect: (conversationId: string) => void;
  selectedId?: string;
}

export default function ConversationList({
  userId,
  onSelect,
  selectedId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allUsers = getUsers();
    const convs = getConversations();

    const convData: Conversation[] = convs.map((conv) => {
      const msgs = getMessages(conv.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const lastMsg = msgs[0];

      const unread = msgs.filter(
        (m) => m.sender_id !== userId && !m.read_at
      ).length;

      const otherUserId = msgs.find((m) => m.sender_id !== userId)?.sender_id;
      const otherUser = conv.type === "direct"
        ? allUsers.find((u) => u.id !== userId) || allUsers.find((u) => u.id === otherUserId)
        : null;

      return {
        id: conv.id,
        name: conv.name,
        type: conv.type,
        last_message: lastMsg?.content || null,
        last_message_time: lastMsg?.created_at || null,
        unread_count: unread,
        other_user: otherUser
          ? { id: otherUser.id, full_name: otherUser.full_name }
          : null,
      };
    });

    convData.sort((a, b) => {
      if (!a.last_message_time) return 1;
      if (!b.last_message_time) return -1;
      return (
        new Date(b.last_message_time).getTime() -
        new Date(a.last_message_time).getTime()
      );
    });

    setConversations(convData);
    setLoading(false);
  }, [userId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-[#7b6b8d]">Loading...</div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-[#7b6b8d]">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(212,175,55,0.05)] transition-colors text-left ${
            selectedId === conv.id ? "bg-[rgba(124,58,237,0.1)]" : ""
          }`}
        >
          <Avatar
            name={
              conv.other_user?.full_name ||
              conv.name ||
              "Group"
            }
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#f8f4ff] truncate">
                {conv.other_user?.full_name ||
                  conv.name ||
                  "Conversation"}
              </span>
              {conv.last_message_time && (
                <span className="text-xs text-[#6b5b7d]">
                  {new Date(conv.last_message_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-sm text-[#7b6b8d] truncate">
                {conv.last_message || "No messages yet"}
              </p>
              {conv.unread_count > 0 && (
                <Badge variant="primary" size="sm">
                  {conv.unread_count}
                </Badge>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
