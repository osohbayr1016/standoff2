"use client";

import { useEffect, useRef } from "react";

interface FireworksCanvasProps {
  durationMs: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  decay: number;
}

export default function FireworksCanvas({ durationMs }: FireworksCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const colors = [
      "#ff6b35",
      "#f7931e",
      "#ffd700",
      "#4ecdc4",
      "#ff5a5f",
      "#c7f0db",
    ];

    let animationId: number;
    let startTime = Date.now();

    const createFirework = (x: number, y: number) => {
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 2 + Math.random() * 3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          decay: 0.015 + Math.random() * 0.015,
        });
      }
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > durationMs) {
        cancelAnimationFrame(animationId);
        return;
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Create new fireworks randomly
      if (Math.random() < 0.08) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.5) + canvas.height * 0.1;
        createFirework(x, y);
      }

      animationId = requestAnimationFrame(animate);
    };

    // Start with initial fireworks
    createFirework(canvas.width * 0.3, canvas.height * 0.3);
    createFirework(canvas.width * 0.7, canvas.height * 0.4);

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [durationMs]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
