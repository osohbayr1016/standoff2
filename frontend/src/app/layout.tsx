import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import Navigation from "./components/Navigation";
import InstagramChat from "./components/InstagramChat";
import NotificationToast from "./components/NotificationToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Sport Connection - Level Up Your Game",
  description:
    "Connect with top coaches, track your progress, and dominate the competitive gaming scene. Your journey to becoming a pro starts here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="transition-colors duration-300">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300 theme-transition`}
      >
        <DarkModeProvider>
          <AuthProvider>
            <SocketProvider>
              <div className="min-h-screen flex flex-col theme-transition">
                <Navigation />
                <main className="flex-1 pt-16 theme-transition">
                  {children}
                </main>
                <Footer />
                <InstagramChat />
                <NotificationToast />
              </div>
            </SocketProvider>
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
