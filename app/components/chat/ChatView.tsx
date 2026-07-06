"use client";

import { useEffect, useState, useRef } from "react";
import { getSession, getUsers } from "@/lib/auth";
import {
  getMessages,
  saveMessage,
  saveNotification,
  getConversationMembers,
  getConversations,
} from "@/lib/store";
import Avatar from "@/app/components/ui/Avatar";
import MessageInput from "./MessageInput";
import { Check, CheckCheck } from "lucide-react";

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
  const [isGroup, setIsGroup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const conv = getConversations().find((c) => c.id === conversationId);
    setIsGroup(conv?.type === "group" || false);

    const allMessages = getMessages(conversationId).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const allUsers = getUsers();
    const formattedMessages = allMessages.map((msg) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      content: msg.content,
      created_at: msg.created_at,
      sender_name:
        allUsers.find((u) => u.id === msg.sender_id)?.full_name || "Unknown",
    }));

    setMessages(formattedMessages);
    setLoading(false);

    const raw = getMessages(conversationId);
    const updated = raw.map((msg) => {
      if (msg.sender_id !== userId && !msg.read_at) {
        return { ...msg, read_at: new Date().toISOString() };
      }
      return msg;
    });
    localStorage.setItem(
      "tw_messages",
      JSON.stringify(
        getMessages().map((m) => {
          const updatedMsg = updated.find((u) => u.id === m.id);
          return updatedMsg || m;
        })
      )
    );
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
    const sender = allUsers.find((u) => u.id === userId);
    const raw = getMessages(conversationId);
    const lastMsg = raw[raw.length - 1];
    const messageId = lastMsg?.id || `msg-${Date.now()}`;

    const newMsg: Message = {
      id: messageId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      sender_name: sender?.full_name || "Unknown",
    };
    setMessages((prev) => [...prev, newMsg]);

    const members = getConversationMembers(conversationId);
    const recipients = members.filter((m) => m !== userId);
    for (const recipientId of recipients) {
      saveNotification({
        user_id: recipientId,
        type: "message",
        title: sender?.full_name || "New message",
        message: content,
        link: `/dashboard/messages/${conversationId}`,
        is_read: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[#7b6b8d]">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-[#7b6b8d] py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === userId;
            const rawMessages = getMessages(conversationId);
            const rawMsg = rawMessages.find((m) => m.id === msg.id);
            const isRead = !!rawMsg?.read_at;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[70%]">
                  {!isOwn && isGroup && (
                    <p className="text-xs text-[#7b6b8d] mb-1 ml-1">
                      {msg.sender_name}
                    </p>
                  )}
                  <div
                    className={`flex items-end gap-2 ${
                      isOwn ? "flex-row-reverse" : ""
                    }`}
                  >
                    {!isOwn && <Avatar name={msg.sender_name} size="sm" />}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? "bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-br-md"
                          : "bg-surface-card text-[#f8f4ff] rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 ${
                          isOwn ? "text-[#f8f4ff]/60" : "text-[#6b5b7d]"
                        }`}
                      >
                        {isOwn && (
                          isRead ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )
                        )}
                        <span className="text-xs">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[rgba(212,175,55,0.08)] p-4">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
