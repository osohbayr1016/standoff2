"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Trophy,
  Globe,
  Heart,
  Target,
  Zap,
  Shield,
} from "lucide-react";
import Navigation from "../components/Navigation";
import PageTransition from "../components/PageTransition";

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />

        <main className="pt-16 sm:pt-20 pb-8 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 sm:mb-12"
            >
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-purple-600 dark:text-green-400 hover:text-purple-700 dark:hover:text-green-300 transition-colors duration-200 mb-4 sm:mb-6 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Нүүр хуудас руу буцах</span>
              </Link>

              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
                  Бидний тухай
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto px-4 sm:px-0 leading-relaxed">
                  Монголын Mobile Legends тоглоомын чансааг дараагийн түвшинд
                  хүргэж, шинээр гарч ирж буй тоглогчид болон багуудын шинэ
                  тэмцээнээр тасрахгүй байх
                </p>
              </div>
            </motion.div>

            {/* Mission Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12 sm:mb-16"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12">
                <div className="text-center mb-8 sm:mb-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 dark:bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Бидний эрхэм зорилго
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto px-4 sm:px-0 leading-relaxed">
                    Манай website нь Монголын Mobile Legends тоглоомын чансааг
                    дараагийн түвшинд хүргэж, шинээр гарч ирж буй тоглогчид
                    болон багуудын шинэ тэмцээнээр тасрахгүй байх, цаашлаад шинэ
                    багт орох хүмүүсийн хараанд өртөх, coach болон caster-уудын
                    түрээс үйлчилгээг нэвтрүүлэх. Mobile Legends тоглоомны шинэ
                    update, шинэ баатар болон шинэ тэмцээн уралдаан мэдээнүүдийг
                    нэг дороос нь бэлтгэж, бүгдийг чанартай тоглогчдод ээлтэй
                    байдлаар шинэ мэдээллээс хоцруулахгүй байх үүднээс үйл
                    ажиллагаа явуулж буй website юм.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Шинэ тоглогчид олох
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      Манай website-г ашиглан шинэ тоглогчид олох, уралдаан
                      тэмцээнд шууд website-аа ашиглан бүртгүүлэх гэж мэт маш
                      олон шинэ шинэ боломжуудыг олгодгоороо Монголд ганц байдаг
                      MLBB тоглоомны цогц website гэдгээрээ онцлогтой.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Цогц үйлчилгээ
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      Coach болон caster-уудын түрээс үйлчилгээг нэвтрүүлэх,
                      Mobile Legends тоглоомны шинэ update, шинэ баатар болон
                      шинэ тэмцээн уралдаан мэдээнүүдийг нэг дороос нь бэлтгэж
                      өгөх.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Vision Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12 sm:mb-16"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-600 dark:to-blue-600 rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 text-white">
                <div className="text-center mb-8 sm:mb-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                    Бидний онцлог
                  </h2>
                  <p className="text-base sm:text-lg text-white/90 max-w-4xl mx-auto px-4 sm:px-0 leading-relaxed">
                    Монголд ганц байдаг MLBB тоглоомны цогц website гэдгээрээ
                    онцлогтой. Манай website-г ашиглан шинэ тоглогчид олох,
                    уралдаан тэмцээнд шууд website-аа ашиглан бүртгүүлэх гэж мэт
                    маш олон шинэ шинэ боломжуудыг олгодгоороо онцлогтой.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      Шинэ мэдээ
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                      Mobile Legends тоглоомны шинэ update, шинэ баатар болон
                      шинэ тэмцээн уралдаан мэдээнүүдийг нэг дороос нь бэлтгэж
                      өгөх.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      Цаашлаад хөгжих
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                      Шинэ багт орох хүмүүсийн хараанд өртөх, coach болон
                      caster-уудын түрээс үйлчилгээг нэвтрүүлэх.
                    </p>
                  </div>

                  <div className="text-center sm:col-span-2 lg:col-span-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      Чанартай үйлчилгээ
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                      Бүгдийг чанартай тоглогчдод ээлтэй байдлаар шинэ
                      мэдээллээс хоцруулахгүй байх үүднээс үйл ажиллагаа явуулж
                      буй website юм.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Features Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-12 sm:mb-16"
            >
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Бидний санал болгож буй зүйлс
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto px-4 sm:px-0 leading-relaxed">
                  Mobile Legends тоглоомны бүх хэсгийг дэмжих дэлгэрэнгүй
                  хэрэгслүүд болон онцлогууд
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Player Profiles */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 dark:bg-green-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    Тоглогчийн профайл
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Таны ур чадвар, амжилтууд, тоглоомын түүхийг харуулсан
                    дэлгэрэнгүй профайл үүсгэх. Шинэ тоглогчид олох боломж.
                  </p>
                </motion.div>

                {/* Team Building */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    Тэмцээн бүртгэл
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Уралдаан тэмцээнд шууд website-аа ашиглан бүртгүүлэх боломж.
                    Шинэ тэмцээн уралдаан мэдээнүүд.
                  </p>
                </motion.div>

                {/* Tournament Organization */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    Шинэ мэдээ
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Mobile Legends тоглоомны шинэ update, шинэ баатар болон шинэ
                    тэмцээн уралдаан мэдээнүүдийг нэг дороос нь бэлтгэж өгөх.
                  </p>
                </motion.div>

                {/* Coaching */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    Coach & Caster
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Coach болон caster-уудын түрээс үйлчилгээг нэвтрүүлэх. Шинэ
                    багт орох хүмүүсийн хараанд өртөх боломж.
                  </p>
                </motion.div>

                {/* Analytics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    Цогц үйлчилгээ
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Монголд ганц байдаг MLBB тоглоомны цогц website гэдгээрээ
                    онцлогтой. Бүх үйлчилгээг нэг дороос авах боломж.
                  </p>
                </motion.div>

                {/* Community */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group sm:col-span-2 lg:col-span-1"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    Чанартай үйлчилгээ
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Бүгдийг чанартай тоглогчдод ээлтэй байдлаар шинэ мэдээллээс
                    хоцруулахгүй байх үүднээс үйл ажиллагаа явуулж буй website
                    юм.
                  </p>
                </motion.div>
              </div>
            </motion.section>

            {/* Stats Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-12 sm:mb-16"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12">
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Бидний онцлог
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                    Монголд ганц байдаг MLBB тоглоомны цогц website
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-green-400 mb-2">
                      MLBB
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Тоглоомын төв
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                      Шинэ
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Мэдээ & Update
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-2">
                      Тэмцээн
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Бүртгэл & Уралдаан
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-600 mb-2">
                      Coach
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      & Caster үйлчилгээ
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-600 dark:to-blue-600 rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 text-white">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                  Манай хамт олонд нэгдээрэй
                </h2>
                <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-4xl mx-auto px-4 sm:px-0 leading-relaxed">
                  Монголын Mobile Legends тоглоомын чансааг дараагийн түвшинд
                  хүргэж, шинээр гарч ирж буй тоглогчид болон багуудын шинэ
                  тэмцээнээр тасрахгүй байх, цаашлаад шинэ багт орох хүмүүсийн
                  хараанд өртөх, coach болон caster-уудын түрээс үйлчилгээг
                  нэвтрүүлэх.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/players" className="w-full sm:w-auto">
                    <motion.button
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 dark:text-green-600 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors duration-200 text-sm sm:text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Тоглогчид харах
                    </motion.button>
                  </Link>

                  <Link href="/auth/register" className="w-full sm:w-auto">
                    <motion.button
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 dark:hover:text-green-600 transition-all duration-200 text-sm sm:text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Эхлэх
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
