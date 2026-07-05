"use client";

import { useEffect, useState, useRef } from "react";
import { getSession, getUsers } from "@/lib/auth";
import { getMessages, saveMessage } from "@/lib/store";
import Avatar from "@/app/components/ui/Avatar";
import MessageInput from "./MessageInput";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name: string;
}

interface ChatViewProps {
  conversationId: string;
  userId: string;
}

export default function ChatView({ conversationId, userId }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const allMessages = getMessages(conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const allUsers = getUsers();
    const formattedMessages = allMessages.map((msg) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      content: msg.content,
      created_at: msg.created_at,
      sender_name: allUsers.find((u) => u.id === msg.sender_id)?.full_name || "Unknown",
    }));

    setMessages(formattedMessages);
    setLoading(false);

    // Mark messages as read
    const STORE_PREFIX = "tw_";
    const raw = getMessages(conversationId);
    const updated = raw.map((msg) => {
      if (msg.sender_id !== userId && !msg.read_at) {
        return { ...msg, read_at: new Date().toISOString() };
      }
      return msg;
    });
    localStorage.setItem(STORE_PREFIX + "messages", JSON.stringify(
      getMessages().map((m) => {
        const updatedMsg = updated.find((u) => u.id === m.id);
        return updatedMsg || m;
      })
    ));
  }, [conversationId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (content: string) => {
    saveMessage({
      conversation_id: conversationId,
      sender_id: userId,
      content,
      read_at: null,
    });

    const allUsers = getUsers();
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      sender_name: allUsers.find((u) => u.id === userId)?.full_name || "Unknown",
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-end gap-2 max-w-[70%] ${
                  msg.sender_id === userId ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar name={msg.sender_name} size="sm" />
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    msg.sender_id === userId
                      ? "bg-primary-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender_id === userId
                        ? "text-primary-200"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-100 p-4">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
