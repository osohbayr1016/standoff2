"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageTransition from "./components/PageTransition";

export default function Home() {
  return (
    <PageTransition>
      <>
        <div className="relative min-h-screen overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              style={{ filter: "blur(8px) brightness(0.3)" }}
              onError={(e) => {
                console.log("Video failed to load, using fallback");
                e.currentTarget.style.display = "none";
              }}
              onLoadStart={() => console.log("Video loading started")}
              onCanPlay={() => console.log("Video can play")}
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
              <source
                src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
                type="video/mp4"
              />
              <source
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                type="video/mp4"
              />
            </video>
            {/* Fallback gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black opacity-80"></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

          {/* Hero Content */}
          <div className="relative z-20 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Main Headline */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                E-Sport Connection
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                Монголын E-Sport дэлхийд мандан бадраг
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                <Link href="/players">
                  <motion.button
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Тоглогчид
                  </motion.button>
                </Link>

                <Link href="/about">
                  <motion.button
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg text-lg hover:bg-white hover:text-black transition-all duration-200 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    About Us
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Вэбсайтын тухай
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Монголын E-Sport дэлхийд мандан бадраг, хамтдаа хөгжье
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <motion.div
                className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 group"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -8,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-500 transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Тамирчид</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Бүх тоглоомоор хүссэн role дээрээ туршлагатай, шинээр гарч ирж
                  буй бүх тамирчдаас сонгох боломж
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 group"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -8,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-500 transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Community</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Хүссэн хүмүүстэйгээ нэгдэж өөрийн багийг бүрдүүлж хамтдаа өсөн
                  дэвжих боломж
                </p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 group"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -8,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-500 transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Гүүр</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  E-Sport organization, Tournament organizer, Coach, Manager бүх
                  салбарын хүмүүс холбогдох боломжтой хамгийн том E-Sport-н
                  website
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </>
    </PageTransition>
  );
}
