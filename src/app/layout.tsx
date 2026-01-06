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
          <div className="min-h-screen flex flex-col relative">
            <Navbar />
            <main className="flex-1 pt-20">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
