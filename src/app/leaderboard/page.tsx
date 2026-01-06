'use client';

import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface LeaderboardUser {
    rank: number;
    name: string;
    score: number;
    exams: number;
    avatar: string;
    topic?: string;
}

export default function LeaderboardPage() {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const q = query(
                    collection(db, 'leaderboard'),
                    orderBy('score', 'desc'),
                    limit(20)
                );
                const querySnapshot = await getDocs(q);
                const data: LeaderboardUser[] = [];

                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    data.push({
                        rank: data.length + 1,
                        name: userData.name || 'Anonymous',
                        score: Math.round(userData.score),
                        exams: 1, // Placeholder until we aggregate per user
                        avatar: userData.avatar || '??',
                        topic: userData.topic
                    });
                });

                // If no data, use some fallback or empty state
                setLeaderboardData(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const topThree = [
        leaderboardData.find(u => u.rank === 2),
        leaderboardData.find(u => u.rank === 1),
        leaderboardData.find(u => u.rank === 3)
    ];

    if (loading) {
        return (
            <div className="container py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Global Leaderboard</h1>
                <p className="text-gray-400">Competing against the best minds in the world.</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {/* Top 3 Podium (Visual) */}
                {leaderboardData.length >= 3 && (
                    <div className="flex items-end justify-center gap-4 mb-12">
                        {/* Rank 2 */}
                        <div className="flex flex-col items-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 1 }}>
                            <div className="w-20 h-20 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center text-xl font-bold mb-4 relative">
                                {topThree[0]?.avatar}
                                <div className="absolute -bottom-3 bg-gray-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">#2</div>
                            </div>
                            <div className="h-32 w-24 bg-gradient-to-t from-gray-800 to-transparent rounded-t-xl border-t border-glass-border"></div>
                            <p className="text-sm font-semibold mt-2">{topThree[0]?.name}</p>
                            <p className="text-xs text-gray-400">{topThree[0]?.score} XP</p>
                        </div>

                        {/* Rank 1 */}
                        <div className="flex flex-col items-center z-10">
                            <div className="absolute -mt-10 text-yellow-400 animate-bounce">
                                <Trophy size={32} />
                            </div>
                            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-2xl font-bold mb-4 relative shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                {topThree[1]?.avatar}
                                <div className="absolute -bottom-3 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">#1</div>
                            </div>
                            <div className="h-40 w-28 bg-gradient-to-t from-primary/30 to-transparent rounded-t-xl border-t border-primary/50"></div>
                            <p className="text-sm font-semibold mt-2 text-yellow-500">{topThree[1]?.name}</p>
                            <p className="text-xs text-yellow-500/80">{topThree[1]?.score} XP</p>
                        </div>

                        {/* Rank 3 */}
                        <div className="flex flex-col items-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 1 }}>
                            <div className="w-20 h-20 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center text-xl font-bold mb-4 relative">
                                {topThree[2]?.avatar}
                                <div className="absolute -bottom-3 bg-orange-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">#3</div>
                            </div>
                            <div className="h-24 w-24 bg-gradient-to-t from-orange-900/50 to-transparent rounded-t-xl border-t border-glass-border"></div>
                            <p className="text-sm font-semibold mt-2">{topThree[2]?.name}</p>
                            <p className="text-xs text-gray-400">{topThree[2]?.score} XP</p>
                        </div>
                    </div>
                )}

                {/* List Items */}
                {leaderboardData.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        No scores yet. Be the first!
                    </div>
                ) : (
                    leaderboardData.map((user) => (
                        <div key={user.rank} className="glass-panel p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <span className={`w-8 text-center font-bold ${user.rank === 1 ? 'text-yellow-400' :
                                    user.rank === 2 ? 'text-gray-400' :
                                        user.rank === 3 ? 'text-orange-700' : 'text-gray-600'
                                    }`}>
                                    #{user.rank}
                                </span>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
                                    {user.avatar}
                                </div>
                                <div>
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">{user.name}</h3>
                                    <p className="text-xs text-gray-400">
                                        {user.topic ? `Expert in ${user.topic}` : "General Knowledge"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-bold text-lg">{user.score.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">Score</div>
                            </div>
                        </div>
                    )))}
            </div>
        </div>
    );
}
