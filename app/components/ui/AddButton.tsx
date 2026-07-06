"use client";

interface AddButtonProps {
  onClick: () => void;
}

export default function AddButton({ onClick }: AddButtonProps) {
  return (
    <button
      className="add-toggle-btn"
      onClick={onClick}
      aria-label="Add"
    >
      <div className="add-bar add-bar-h" />
      <div className="add-bar add-bar-v" />
    </button>
  );
}
