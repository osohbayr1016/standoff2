"use client";

import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const segments = 12;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % segments);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const sizeConfig = {
    sm: { container: 32, dot: 6, radius: 12 },
    md: { container: 64, dot: 12, radius: 24 },
    lg: { container: 96, dot: 16, radius: 36 },
  };

  const config = sizeConfig[size];

  const getColor = (index: number) => {
    const distance = (index - activeIndex + segments) % segments;

    if (distance === 0) return "#f97316";
    if (distance === 1) return "#ea580c";
    if (distance === 2) return "#c2410c";
    if (distance === 3) return "#9a3412";
    if (distance === 4) return "#78350f";
    if (distance === 5) return "#6b7280";
    if (distance === 6) return "#4b5563";
    return "#374151";
  };

  const spinner = (
    <div
      className="relative"
      style={{ width: config.container, height: config.container }}
    >
      {[...Array(segments)].map((_, i) => {
        const angle = (i * 360) / segments - 90;
        const x =
          Math.cos((angle * Math.PI) / 180) * config.radius +
          config.container / 2 -
          config.dot / 2;
        const y =
          Math.sin((angle * Math.PI) / 180) * config.radius +
          config.container / 2 -
          config.dot / 2;

        return (
          <div
            key={i}
            className="absolute rounded-full transition-colors duration-100"
            style={{
              width: config.dot,
              height: config.dot,
              left: x,
              top: y,
              backgroundColor: getColor(i),
            }}
          />
        );
      })}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

