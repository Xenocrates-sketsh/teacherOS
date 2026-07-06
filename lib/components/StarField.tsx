"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
  baseX: number;
  baseY: number;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const starCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 5000));

    starsRef.current = Array.from({ length: starCount }, () => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      };
    });

    const handleMouse = (e: MouseEvent) => {
      const rx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ry = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current = { x: rx * 30, y: ry * 30 };
    };

    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const rx = (touch.clientX / window.innerWidth - 0.5) * 2;
        const ry = (touch.clientY / window.innerHeight - 0.5) * 2;
        mouseRef.current = { x: rx * 30, y: ry * 30 };
      }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = (e.gamma || 0) / 45;
      const beta = (e.beta || 0) / 45;
      mouseRef.current = { x: gamma * 20, y: beta * 20 };
    };

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("touchmove", handleTouch);
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    let time = 0;

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: mx, y: my } = mouseRef.current;

      for (const star of starsRef.current) {
        const parallaxX = star.baseX + mx * star.speed * 10;
        const parallaxY = star.baseY + my * star.speed * 10;

        star.x += (parallaxX - star.x) * 0.05;
        star.y += (parallaxY - star.y) * 0.05;

        const twinkle =
          Math.sin(time * star.twinkleSpeed * 10 + star.twinklePhase) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192, 132, 252, ${star.opacity * twinkle})`;
        ctx.fill();

        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(192, 132, 252, ${star.opacity * twinkle * 0.15})`;
          ctx.fill();
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("touchmove", handleTouch);
      if (window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}
