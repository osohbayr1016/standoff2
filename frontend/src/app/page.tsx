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
                    src: "https://static.wikia.nocookie.net/mobile-legends/images/8/8c/Alucard_skin_1.png",
                    alt: "Alucard - The Dark Knight",
                  },
                  {
                    src: "https://static.wikia.nocookie.net/mobile-legends/images/2/2c/Gusion_skin_1.png",
                    alt: "Gusion - The Mystic Blade",
                  },
                  {
                    src: "https://static.wikia.nocookie.net/mobile-legends/images/4/4c/Kagura_skin_1.png",
                    alt: "Kagura - The Onmyoji Master",
                  },
                  {
                    src: "https://static.wikia.nocookie.net/mobile-legends/images/7/7c/Layla_skin_1.png",
                    alt: "Layla - The Malefic Gunner",
                  },
                  {
                    src: "https://static.wikia.nocookie.net/mobile-legends/images/5/5c/Miya_skin_1.png",
                    alt: "Miya - The Moonlight Archer",
                  },
                  {
                    src: "https://static.wikia.nocookie.net/mobile-legends/images/3/3c/Franco_skin_1.png",
                    alt: "Franco - The Frozen Warrior",
                  },
                  {
                    src: "https://static.wikia.nocookie.net/mobile-legends/images/1/1c/Angela_skin_1.png",
                    alt: "Angela - The Sacred Oath",
                  },
                  {
                    src: "https://static.wikia.nocookie.net/mobile-legends/images/9/9c/Bruno_skin_1.png",
                    alt: "Bruno - The Mecha Legions",
                  },
                  {
                    src: "https://static.wikia.nocookie.net/mobile-legends/images/6/6c/Cyclops_skin_1.png",
                    alt: "Cyclops - The Master of Magic",
                  },
                  {
                    src: "https://static.wikia.nocookie.net/mobile-legends/images/0/0c/Estes_skin_1.png",
                    alt: "Estes - The Elf King",
                  },
                ]}
                height={120}
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
                FEATURED
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ScrollReveal>
                <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-600/20 to-blue-600/20 shadow-xl relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-black/60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2">
                        Tournament Highlights
                      </h3>
                      <p className="text-gray-300">
                        Watch the best plays from recent tournaments
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-green-600/20 to-teal-600/20 shadow-xl relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-teal-900/30 to-black/60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2">
                        Pro Player Spotlights
                      </h3>
                      <p className="text-gray-300">
                        Meet the top players in the community
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </>
    </PageTransition>
  );
}
