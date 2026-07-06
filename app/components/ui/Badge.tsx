"use client";

import { ReactNode } from "react";

interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  children: ReactNode;
}

export default function Badge({
  variant = "default",
  size = "sm",
  children,
}: BadgeProps) {
  const variants = {
    default: "bg-surface-card text-[#cbd5e1]",
    primary: "bg-[rgba(212,175,55,0.15)] text-gold-400",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
