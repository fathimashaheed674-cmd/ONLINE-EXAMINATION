import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Exam Platform",
  description: "Next-gen online examination system with AI integration.",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col relative bg-[#050505]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/10 blur-[120px] -z-10 pointer-events-none" />
            <Navbar />
            <main className="flex-1 pt-32 pb-20">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
