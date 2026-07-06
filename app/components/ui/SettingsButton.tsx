"use client";

interface SettingsButtonProps {
  onClick: () => void;
  open?: boolean;
}

export default function SettingsButton({ onClick, open }: SettingsButtonProps) {
  return (
    <button
      className="sidebar-toggle-btn"
      onClick={onClick}
      aria-label={open ? "Close sidebar" : "Open sidebar"}
    >
      <div className={`bar bar1 ${open ? "open" : ""}`} />
      <div className={`bar bar2 ${open ? "open" : ""}`} />
    </button>
  );
}
