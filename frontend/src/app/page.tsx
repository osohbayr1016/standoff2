"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageTransition from "./components/PageTransition";
import IntroOverlay from "./components/IntroOverlay";
import RecentMatches from "./components/RecentMatches";
import DailyRewards from "./components/DailyRewards";
import LiveLeaderboardTop5 from "./components/LiveLeaderboardTop5";
import { useAuth } from "./contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <PageTransition>
      <>
        <IntroOverlay />

        {/* Main Container */}
        <div className="min-h-screen bg-[#0f1419] px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl"
              style={{ height: "450px" }}
            >
              {/* Background Image with Gradient Overlay */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage:
                    "url(/Gemini_Generated_Image_aph2rnaph2rnaph2.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>

              {/* Hero Content */}
              <div className="relative z-10 flex items-center h-full px-8 lg:px-16">
                <div className="max-w-2xl">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-tight"
                  >
                    <span className="text-white">STAND</span>
                    <span className="text-orange-500">OFF</span>
                    <span className="text-white"> 2</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-2xl sm:text-3xl font-bold text-white/90 mb-6"
                  >
                    COMPETITIVE HUB
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-lg text-gray-300 mb-8"
                  >
                    Join the competitive scene, climb the ranks, and earn
                    exclusive rewards
                  </motion.p>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Link href={user ? "/matchmaking" : "/auth/login"}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-12 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-lg shadow-2xl transition-all duration-300"
                      >
                        Find Match
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Dashboard Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <LiveLeaderboardTop5 />
              <RecentMatches />
              <DailyRewards />
            </motion.div>
          </div>
        </div>
      </>
    </PageTransition>
  );
}
