'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
            <div className="app-container mx-auto pointer-events-auto">
                <div className="glass-panel rounded-3xl px-6 py-4 flex items-center justify-between shadow-2xl">
                    <Link href="/" className="text-xl font-bold flex items-center gap-2 group">
                        <span className="text-gradient font-black tracking-tighter text-2xl uppercase">MOCK TEST</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-10 text-sm font-semibold tracking-wide text-gray-400">
                        <Link href="/dashboard" className="hover:text-white transition-colors relative group">
                            Dashboard
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </Link>
                        <Link href="/analytics" className="hover:text-white transition-colors relative group">
                            Analytics
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </Link>
                        <Link href="/leaderboard" className="hover:text-white transition-colors relative group">
                            Leaderboard
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-5">
                                <span className="text-xs font-medium text-gray-500 hidden lg:block bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    {user.email}
                                </span>
                                <button
                                    onClick={() => logout()}
                                    className="glass-btn px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                                >
                                    <LogOut size={14} /> Log Out
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href="/auth" className="text-sm font-bold hover:text-white text-gray-400 transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/auth?mode=signup" className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
