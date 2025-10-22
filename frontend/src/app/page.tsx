"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageTransition from "./components/PageTransition";
import ScrollReveal from "./components/ScrollReveal";
import IntroOverlay from "./components/IntroOverlay";
import HeroesMarquee from "./components/HeroesMarquee";
import StatsRow from "./components/StatsRow";
import OngoingTournaments from "./components/OngoingTournaments";
import LatestNews from "./components/LatestNews";
import MatchLeaderboard from "./components/MatchLeaderboard";
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
                    WELCOME TO
                    <br />
                    MOBILE LEGENDS COMMUNITY
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

                  {/* Ongoing Tournaments */}
                  <OngoingTournaments />

                  {/* Match Leaderboard */}
                  <MatchLeaderboard />
                </div>

                {/* Right side empty to show hero art background, reserved for future illustration */}
                <div className="hidden lg:block" />
              </div>
            </div>
          </div>
        </div>

        {/* MLBB Heroes Section - Seamless gradient continuation */}
        <section className="relative py-16 bg-gradient-to-b from-black via-blue-900/80 to-black">
          {/* Background pattern overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  MOBILE LEGENDS HEROES
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Discover the most powerful heroes in the Land of Dawn
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <HeroesMarquee
                heroes={[
                  {
                    src: "/heroes/akai.jpg",
                    alt: "Akai - Panda Warrior",
                  },
                  {
                    src: "/heroes/aldous.jpg",
                    alt: "Aldous - Contractor",
                  },
                  {
                    src: "/heroes/alice.jpg",
                    alt: "Alice - Queen of Blood",
                  },
                  {
                    src: "/heroes/alpha.jpg",
                    alt: "Alpha - Blade of Enmity",
                  },
                  {
                    src: "/heroes/alucard.jpg",
                    alt: "Alucard - Demon Hunter",
                  },
                  {
                    src: "/heroes/angela.jpg",
                    alt: "Angela - Bunnylove",
                  },
                  {
                    src: "/heroes/argus.jpg",
                    alt: "Argus - Dark Angel",
                  },
                  {
                    src: "/heroes/arlott.jpg",
                    alt: "Arlott - Lone Lancer",
                  },
                  {
                    src: "/heroes/atlas.jpg",
                    alt: "Atlas - Ocean Gladiator",
                  },
                  {
                    src: "/heroes/aulus.jpg",
                    alt: "Aulus - Warrior of Ferocity",
                  },
                  {
                    src: "/heroes/aurora.jpg",
                    alt: "Aurora - Maiden of the Glacier",
                  },
                  {
                    src: "/heroes/badang.jpg",
                    alt: "Badang - Tribal Warrior",
                  },
                  {
                    src: "/heroes/balmond.jpg",
                    alt: "Balmond - Bloody Beast",
                  },
                ]}
                height={180}
                speed={30}
              />
            </ScrollReveal>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-20 bg-gradient-to-b from-black/90 to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                LATEST NEWS
              </h2>
            </ScrollReveal>
            <ScrollReveal>
              <LatestNews />
            </ScrollReveal>
          </div>
        </section>
      </>
    </PageTransition>
  );
}
