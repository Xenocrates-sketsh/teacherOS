"use client";

import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, padding = "md", glow = false, className = "", children, ...props }, ref) => {
    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={`bg-surface-card/40 backdrop-blur-xl rounded-2xl border border-[rgba(212,175,55,0.08)] ${
          hover
            ? "hover:border-gold-400/20 hover:shadow-xl hover:shadow-gold-500/5 hover:-translate-y-0.5 transition-all duration-500 cursor-pointer"
            : ""
        } ${
          glow ? "shadow-lg shadow-gold-500/5" : ""
        } ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
