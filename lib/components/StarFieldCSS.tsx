"use client";

import { useMemo } from "react";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateStars(count: number, seed: number): string {
  const rand = seededRandom(seed);
  const positions: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rand() * 2000);
    const y = Math.floor(rand() * 2000);
    positions.push(`${x}px ${y}px #fff`);
  }
  return positions.join(", ");
}

export default function StarFieldCSS() {
  const small1 = useMemo(() => generateStars(300, 42), []);
  const small2 = useMemo(() => generateStars(300, 43), []);
  const med1 = useMemo(() => generateStars(150, 137), []);
  const med2 = useMemo(() => generateStars(150, 138), []);
  const large1 = useMemo(() => generateStars(80, 256), []);
  const large2 = useMemo(() => generateStars(80, 257), []);

  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at bottom, #2d1b4e 0%, #1a0a2e 40%, #090a0f 100%)",
        }}
      >
        <div style={{ position: "absolute", width: 1, height: 1, borderRadius: "50%", boxShadow: small1, animation: "sd1 50s linear infinite" }} />
        <div style={{ position: "absolute", top: 2000, width: 1, height: 1, borderRadius: "50%", boxShadow: small2, animation: "sd1 50s linear infinite" }} />
        <div style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", boxShadow: med1, animation: "sd2 100s linear infinite" }} />
        <div style={{ position: "absolute", top: 2000, width: 2, height: 2, borderRadius: "50%", boxShadow: med2, animation: "sd2 100s linear infinite" }} />
        <div style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", boxShadow: large1, animation: "sd3 150s linear infinite" }} />
        <div style={{ position: "absolute", top: 2000, width: 3, height: 3, borderRadius: "50%", boxShadow: large2, animation: "sd3 150s linear infinite" }} />
      </div>
      <style>{`
        @keyframes sd1 { from { transform: translateY(0); } to { transform: translateY(-2000px); } }
        @keyframes sd2 { from { transform: translateY(0); } to { transform: translateY(-2000px); } }
        @keyframes sd3 { from { transform: translateY(0); } to { transform: translateY(-2000px); } }
      `}</style>
    </>
  );
}
