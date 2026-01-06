'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface ExamResult {
    id: string;
    topic: string;
    score: number;
    createdAt: any;
}

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            try {
                const q = query(
                    collection(db, `users/${user.uid}/exams`),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const results = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as ExamResult[];
                setHistory(results);
            } catch (error) {
                console.error("Error loading analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    if (!user) {
        return (
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
                <p className="text-gray-400">You need to be logged in to view your analytics.</p>
            </div>
        );
    }

    // Calculate Average
    const averageScore = history.length > 0
        ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)
        : 0;

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
            <p className="text-gray-400 mb-10">Deep dive into your learning patterns.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Score History Chart */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-6">Recent Exams</h3>
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-white/10 rounded w-3/4"></div>
                            <div className="h-4 bg-white/10 rounded w-1/2"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-gray-500">No exams taken yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {history.slice(0, 5).map((exam) => (
                                <div key={exam.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                    <span className="font-medium text-gray-300">{decodeURIComponent(exam.topic)}</span>
                                    <span className={`font-mono font-bold ${exam.score >= 80 ? 'text-green-400' :
                                            exam.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {Math.round(exam.score)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Weakness Radar (Mock List for now, can be computed real later) */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-6">Overview</h3>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="text-4xl font-bold text-white">{averageScore}%</div>
                            <div className="text-sm text-gray-400">Average Score</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary">{history.length}</div>
                            <div className="text-sm text-gray-400">Exams Completed</div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                        <h4 className="font-bold text-primary mb-1">AI Insight</h4>
                        <p className="text-sm text-gray-300">
                            {history.length < 3 ? "Take more exams to get personalized AI insights!" :
                                averageScore > 80 ? "You're doing great! Try tackling 'Advanced Mathematics' to challenge yourself." :
                                    "Consistency is key. Consider reviewing topics where you scored below 60%."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
