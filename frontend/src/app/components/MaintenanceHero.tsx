"use client";

import { motion } from "framer-motion";
import { FaDiscord } from "react-icons/fa";

export default function MaintenanceHero() {
  return (
    <div className="relative min-h-[500px] lg:min-h-[700px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
      {/* Background Image with optimized loading and overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/Gemini_Generated_Image_aph2rnaph2rnaph2.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Darker overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#0f1419]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[500px] lg:min-h-[700px] text-center px-6 md:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block px-4 py-1.5 mb-8 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-500 text-sm font-semibold tracking-wider uppercase"
          >
            🚧 Site is under improvement
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
            Манай website <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">сайжруулалт</span> хийгдэж байна
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Шинэ мэдээллүүд discord server дээр тогтмол явагдаж байгаа тул discord server-тээ ороорой. 12.26-нд ажиллагаанд төлөвлөгөөтэй байна.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <a
              href="https://discord.gg/nby8Wwg9"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-4 px-12 py-6 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-2xl rounded-2xl transition-all shadow-[0_15px_40px_rgba(88,101,242,0.4)] hover:shadow-[0_20px_50px_rgba(88,101,242,0.6)] hover:-translate-y-1 active:scale-95"
            >
              <FaDiscord className="text-4xl group-hover:animate-bounce" />
              Discord Server-т нэгдэх
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0f1419] to-transparent z-10" />
    </div>
  );
}
