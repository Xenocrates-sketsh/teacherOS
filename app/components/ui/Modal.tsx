"use client";

import { Fragment, ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-[#0a0015]/75 transition-opacity"
          onClick={onClose}
        />
        <div
          className={`relative bg-surface-elevated rounded-xl shadow-2xl border border-[rgba(212,175,55,0.15)] ${sizes[size]} w-full transform transition-all`}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-[rgba(212,175,55,0.08)] px-6 py-4">
              <h3 className="text-lg font-semibold text-[#f8f4ff]">{title}</h3>
              <button
                onClick={onClose}
                className="text-[#6b5b7d] hover:text-[#7b6b8d] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
