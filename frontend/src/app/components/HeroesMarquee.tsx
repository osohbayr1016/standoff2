"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface HeroesMarqueeProps {
  heroes: { src: string; alt: string }[];
  height?: number;
  speed?: number; // pixels per second
}

export default function HeroesMarquee({
  heroes,
  height = 120,
  speed = 40,
}: HeroesMarqueeProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let offset = 0;

    const tick = () => {
      offset -= speed / 60; // approx 60fps
      if (offset <= -el.scrollWidth / 2) offset = 0; // seamless loop
      el.style.transform = `translateX(${offset}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  const doubled = [...heroes, ...heroes];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40" />
      <div
        className="whitespace-nowrap will-change-transform"
        ref={ref}
        style={{ transform: "translateX(0px)" }}
      >
        {doubled.map((h, i) => (
          <span
            key={`${h.src}-${i}`}
            className="inline-flex items-center justify-center mx-4"
          >
            {/* Use unoptimized to allow remote images without config changes */}
            <Image
              src={h.src}
              alt={h.alt}
              width={height}
              height={height}
              className="h-auto w-auto object-contain drop-shadow-xl"
              unoptimized
            />
          </span>
        ))}
      </div>
    </div>
  );
}
