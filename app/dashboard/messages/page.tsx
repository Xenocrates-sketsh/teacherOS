"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession, getUsers } from "@/lib/auth";
import { getConversations, saveConversation, getMessages, saveMessage } from "@/lib/store";
import ConversationList from "@/app/components/chat/ConversationList";
import ChatView from "@/app/components/chat/ChatView";
import Modal from "@/app/components/ui/Modal";
import Button from "@/app/components/ui/Button";
import Avatar from "@/app/components/ui/Avatar";
import { Plus, MessageSquare, Search, X } from "lucide-react";

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.conversationId as string | undefined;
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    setUserId(session.id);
    setLoading(false);
  }, [router]);

  const searchUsers = useCallback((query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const allUsers = getUsers().filter(
      (u) =>
        u.full_name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
    setSearchResults(allUsers);
    setSearching(false);
  }, []);

  const startConversation = (otherUserId: string) => {
    setCreating(true);

    // Check if conversation already exists
    const existingConvs = getConversations();
    const existingConv = existingConvs.find((c) => {
      const msgs = getMessages(c.id);
      const participants = new Set(msgs.map((m) => m.sender_id));
      participants.add(otherUserId);
      // Check if both users have sent messages in this conversation
      const hasUser1 = msgs.some((m) => m.sender_id === userId);
      const hasUser2 = msgs.some((m) => m.sender_id === otherUserId);
      return c.type === "direct" && participants.size <= 2 && (hasUser1 || hasUser2);
    });

    if (existingConv) {
      setShowNewModal(false);
      setCreating(false);
      setUserSearch("");
      setSearchResults([]);
      router.push(`/dashboard/messages/${existingConv.id}`);
      return;
    }

    const newConv = saveConversation({
      name: null,
      type: "direct",
      class_id: null,
      workspace_id: null,
    });

    // Save a system message to link both users
    saveMessage({
      conversation_id: newConv.id,
      sender_id: userId!,
      content: "Conversation started",
      read_at: null,
    });

    setShowNewModal(false);
    setCreating(false);
    setUserSearch("");
    setSearchResults([]);
    router.push(`/dashboard/messages/${newConv.id}`);
  };

  if (loading || !userId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-[#7b6b8d]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] glass-card overflow-hidden">
      <div
        className={`w-80 border-r border-[rgba(212,175,55,0.08)] flex flex-col ${
          conversationId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-[rgba(212,175,55,0.08)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#f8f4ff]">Messages</h2>
          <button
            onClick={() => setShowNewModal(true)}
            className="p-1.5 text-[#6b5b7d] hover:text-gold-400 hover:bg-[rgba(124,58,237,0.1)] rounded-lg transition-colors"
            title="New message"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            userId={userId}
            onSelect={(id) => router.push(`/dashboard/messages/${id}`)}
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
          <div className="flex-1 flex items-center justify-center text-[#7b6b8d] flex-col gap-3">
            <MessageSquare className="w-12 h-12 text-gray-300" />
            <p>Select a conversation to start chatting</p>
            <Button variant="primary" onClick={() => setShowNewModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Message
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showNewModal}
        onClose={() => {
          setShowNewModal(false);
          setUserSearch("");
          setSearchResults([]);
        }}
        title="New Message"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5b7d]" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                searchUsers(e.target.value);
              }}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 border border-[rgba(212,175,55,0.15)] rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              autoFocus
            />
          </div>

          {searching && (
            <p className="text-sm text-[#7b6b8d] text-center py-4">Searching...</p>
          )}

          {!searching && searchResults.length === 0 && userSearch.length >= 2 && (
            <p className="text-sm text-[#7b6b8d] text-center py-4">No users found</p>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {searchResults
                .filter((u) => u.id !== userId)
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startConversation(u.id)}
                    disabled={creating}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[rgba(212,175,55,0.05)] rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Avatar name={u.full_name} size="md" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#f8f4ff]">{u.full_name}</p>
                      <p className="text-xs text-[#7b6b8d]">{u.email}</p>
                    </div>
                    <span className="ml-auto text-xs text-[#6b5b7d] capitalize bg-surface-card px-2 py-0.5 rounded-full">
                      {u.role}
                    </span>
                  </button>
                ))}
            </div>
          )}

          {userSearch.length < 2 && (
            <p className="text-xs text-[#6b5b7d] text-center py-4">Type at least 2 characters to search</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
