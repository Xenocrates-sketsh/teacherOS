"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0015] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "btn-gold shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30",
      secondary:
        "bg-surface-card text-[#f8f4ff] hover:bg-[rgba(212,175,55,0.1)] hover:text-gold-400 focus:ring-gold-400/30 border border-[rgba(212,175,55,0.08)]",
      outline:
        "border border-[rgba(212,175,55,0.15)] bg-[rgba(255,255,255,0.02)] text-[#cbd5e1] hover:bg-[rgba(212,175,55,0.05)] hover:border-gold-400/30 focus:ring-gold-400/30",
      ghost:
        "text-[#9d8ab5] hover:text-[#cbd5e1] hover:bg-[rgba(212,175,55,0.08)] focus:ring-gold-400/30",
      danger:
        "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 focus:ring-red-500/30 shadow-sm",
    };

    const sizes = {
      sm: "px-3.5 py-1.5 text-xs gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-8 py-3.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
