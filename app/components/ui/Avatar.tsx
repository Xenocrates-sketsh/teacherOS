"use client";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}

export default function Avatar({ src, alt, name, size = "md" }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name: string) => {
    const colors = [
      "bg-gradient-to-br from-gold-500 to-gold-400",
      "bg-gradient-to-br from-green-500 to-emerald-400",
      "bg-gradient-to-br from-yellow-500 to-amber-400",
      "bg-gradient-to-br from-red-500 to-rose-400",
      "bg-gradient-to-br from-purple-500 to-violet-400",
      "bg-gradient-to-br from-pink-500 to-fuchsia-400",
      "bg-gradient-to-br from-indigo-500 to-blue-400",
      "bg-gradient-to-br from-teal-500 to-cyan-400",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || "Avatar"}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  if (name) {
    return (
      <div
        className={`${sizes[size]} ${getBackgroundColor(
          name
        )} rounded-full flex items-center justify-center text-white font-medium`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} bg-gray-300 rounded-full flex items-center justify-center text-[#9d8ab5]`}
    >
      <svg
        className="w-1/2 h-1/2"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}
