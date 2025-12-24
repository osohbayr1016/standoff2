"use client";

import { motion } from "framer-motion";

export default function ModeratorHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-8"
    >
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
        Moderator Panel
      </h1>
    </motion.div>
  );
}

