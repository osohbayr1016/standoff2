"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageTransition from "./components/PageTransition";
import IntroOverlay from "./components/IntroOverlay";
import MaintenanceHero from "./components/MaintenanceHero";
import { useAuth } from "./contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <PageTransition>
      <>
        <IntroOverlay />

        {/* Main Container */}
        <div className="min-h-screen bg-[#0f1419] px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full py-8">
            {/* Maintenance Hero Section */}
            <MaintenanceHero />
          </div>
        </div>
      </>
    </PageTransition>
  );
}
