"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageTransition from "./components/PageTransition";
import ScrollReveal from "./components/ScrollReveal";
import IntroOverlay from "./components/IntroOverlay";
import HeroesMarquee from "./components/HeroesMarquee";
import StatsRow from "./components/StatsRow";
import { useAuth } from "./contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <PageTransition>
      <>
        <IntroOverlay />
        <div className="relative min-h-screen overflow-hidden">
          {/* Image Background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage:
                "url(https://images.1v9.gg/Starfall%20Knight%20Granger%20mobile%20legends-2bc20663f13c.webp)",
              backgroundSize: "cover",
              backgroundPosition: "right center",
              filter: "blur(4px) brightness(0.6)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/50 to-black/70" />
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

          {/* Hero Content (MLBB layout) */}
          <div className="relative z-20 flex items-center min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="max-w-2xl">
                  {/* Main Headline */}
                  <motion.h1
                    className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    EXPERIENCE THE THRILL
                    <br />
                    OF BATTLE
                  </motion.h1>

                  {/* Primary CTA */}
                  {!user && (
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.15 }}
                    >
                      <Link href="/auth/login">
                        <button className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg shadow-lg transition-colors">
                          Нэвтрэх
                        </button>
                      </Link>
                    </motion.div>
                  )}

                  {/* Secondary CTAs */}
                  <motion.div
                    className="flex flex-wrap gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                  >
                    <Link href="/tournaments">
                      <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-sm transition-colors">
                        ТЭМЦЭЭНҮҮД
                      </button>
                    </Link>
                    <Link href="/players">
                      <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-sm transition-colors">
                        ТОГЛОГЧИД
                      </button>
                    </Link>
                    <Link href="/about">
                      <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-sm transition-colors">
                        БИДНИЙ ТУХАЙ
                      </button>
                    </Link>
                  </motion.div>

                  {/* Stats Row (live data) */}
                  <StatsRow />
                </div>

                {/* Right side empty to show hero art background, reserved for future illustration */}
                <div className="hidden lg:block" />
              </div>
            </div>
          </div>
        </div>

        {/* MLBB Heroes Soft Marquee */}
        <section className="py-10 bg-black/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <HeroesMarquee
                heroes={[
                  { src: "https://i.imgur.com/fXk3eGT.png", alt: "Alucard" },
                  { src: "https://i.imgur.com/2PjQ4m7.png", alt: "Gusion" },
                  { src: "https://i.imgur.com/1p0uM1J.png", alt: "Kagura" },
                  { src: "https://i.imgur.com/X3j2y1Q.png", alt: "Layla" },
                  { src: "https://i.imgur.com/4rYwQmY.png", alt: "Miya" },
                  { src: "https://i.imgur.com/2PjQ4m7.png", alt: "Gusion" },
                  { src: "https://i.imgur.com/fXk3eGT.png", alt: "Alucard" },
                ]}
                height={100}
                speed={40}
              />
            </ScrollReveal>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                FEATURED
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ScrollReveal>
                <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-[url('/mlbb/featured-1.png')] bg-cover bg-center shadow-xl" />
              </ScrollReveal>
              <ScrollReveal>
                <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-[url('/mlbb/featured-2.png')] bg-cover bg-center shadow-xl" />
              </ScrollReveal>
            </div>
          </div>
        </section>
      </>
    </PageTransition>
  );
}
