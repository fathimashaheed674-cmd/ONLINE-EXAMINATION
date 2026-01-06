'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 p-4">
            <div className="container mx-auto glass-panel rounded-2xl px-6 py-3 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold flex items-center gap-2">
                    <span className="text-gradient">AI Nexus</span>
                </Link>
                <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
                    <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                    <Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link>
                    <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-400 hidden sm:block">
                                {user.email}
                            </span>
                            <button
                                onClick={() => logout()}
                                className="glass-btn px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-white/10 text-red-400 border-red-500/20"
                            >
                                <LogOut size={14} /> Log Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link href="/auth" className="text-sm font-medium hover:text-white text-gray-300 transition-colors">
                                Log in
                            </Link>
                            <Link href="/auth?mode=signup" className="glass-btn px-5 py-2 rounded-full text-sm font-semibold">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
