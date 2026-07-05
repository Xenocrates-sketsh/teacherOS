"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
    const fetchConversations = async () => {
      const supabase = createClient();

      const { data: memberships } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", userId);

      const convIds = memberships?.map((m) => m.conversation_id) || [];

      if (convIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .in("id", convIds);

      const convData: Conversation[] = [];

      for (const conv of convs || []) {
          const { data: members } = await supabase
        .from("conversation_members")
        .select("user_id, users(*)")
        .eq("conversation_id", conv.id) as any;

        const otherMember = members?.find(
          (m: any) => m.user_id !== userId
        )?.users;

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .is("read_at", null)
          .neq("sender_id", userId);

        convData.push({
          id: conv.id,
          name: conv.name,
          type: conv.type,
          last_message: lastMsg?.content || null,
          last_message_time: lastMsg?.created_at || null,
          unread_count: unreadCount || 0,
          other_user:
            conv.type === "direct" && otherMember
              ? {
                  id: otherMember.id,
                  full_name: otherMember.full_name,
                }
              : null,
        });
      }

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
    };

    fetchConversations();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading...</div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
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
          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
            selectedId === conv.id ? "bg-primary-50" : ""
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
              <span className="font-medium text-gray-900 truncate">
                {conv.other_user?.full_name ||
                  conv.name ||
                  "Conversation"}
              </span>
              {conv.last_message_time && (
                <span className="text-xs text-gray-400">
                  {new Date(conv.last_message_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-sm text-gray-500 truncate">
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
