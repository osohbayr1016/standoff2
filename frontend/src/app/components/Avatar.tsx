"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeConfig = {
  xs: { container: "w-6 h-6", icon: "w-3 h-3", image: 24 },
  sm: { container: "w-8 h-8", icon: "w-4 h-4", image: 32 },
  md: { container: "w-10 h-10", icon: "w-5 h-5", image: 40 },
  lg: { container: "w-12 h-12", icon: "w-6 h-6", image: 48 },
  xl: { container: "w-16 h-16", icon: "w-8 h-8", image: 64 },
};

export default function Avatar({
  src,
  alt,
  size = "md",
  className = "",
}: AvatarProps) {
  const config = sizeConfig[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={config.image}
        height={config.image}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${config.container} rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ${className}`}
    >
      <User className={`${config.icon} text-gray-400`} />
    </div>
  );
}
