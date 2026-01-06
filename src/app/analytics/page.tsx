'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { BarChart2 } from 'lucide-react';
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
        <div className="app-container py-12">
            <h1 className="text-4xl font-black mb-3">Performance <span className="text-gradient">Analytics</span></h1>
            <p className="text-gray-400 text-lg mb-10">Deep dive into your learning patterns and AI insights.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Score History List */}
                <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <BarChart2 size={100} />
                    </div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Recent Exams
                    </h3>
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-14 bg-white/5 rounded-xl"></div>
                            ))}
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 border-2 border-dashed border-white/5 rounded-2xl">
                            No exams taken yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.slice(0, 5).map((exam) => (
                                <div key={exam.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-200 group-hover:text-primary transition-colors">{decodeURIComponent(exam.topic)}</span>
                                        <span className="text-xs text-gray-500">{new Date(exam.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`text-xl font-black ${exam.score >= 80 ? 'text-success' :
                                        exam.score >= 50 ? 'text-primary' : 'text-red-400'
                                        }`}>
                                        {Math.round(exam.score)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Performance Summary */}
                <div className="flex flex-col gap-6">
                    <div className="glass-panel p-8 rounded-2xl flex-1">
                        <h3 className="text-xl font-bold mb-8">Performance Summary</h3>
                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div>
                                <div className="text-5xl font-black text-white mb-1">{averageScore}%</div>
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Average Score</div>
                            </div>
                            <div>
                                <div className="text-5xl font-black text-primary mb-1">{history.length}</div>
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Exams Completed</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-gray-400">Target Accuracy</span>
                                <span className="font-bold">90%</span>
                            </div>
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                                    style={{ width: `${Math.min(averageScore, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-10 p-5 bg-primary/10 border border-primary/20 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">✨</div>
                            <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                                AI Smart Suggestion
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {history.length === 0 ? "Initial assessment required. Start with a 'General Knowledge' practice exam." :
                                    history.length < 3 ? "Great start! Take a few more exams to help the AI map your learning curves." :
                                        averageScore > 80 ? "You're demonstrating mastery. We suggest trying 'Advanced Mathematics' or 'Physics: Mechanics' to push your limits." :
                                            "Focus on consistency. Your performance in recently attempted topics suggests a need for targeted review in core concepts."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Topic Breakdown - New Feature */}
            {!loading && history.length > 0 && (
                <div className="animate-fade-in delay-500">
                    <h2 className="text-2xl font-black mb-8">Topic <span className="text-gradient">Proficiency</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.from(new Set(history.map(h => h.topic))).slice(0, 3).map(topic => {
                            const topicExams = history.filter(h => h.topic === topic);
                            const topicAvg = Math.round(topicExams.reduce((acc, curr) => acc + curr.score, 0) / topicExams.length);
                            return (
                                <div key={topic} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{topicExams.length} Attempt{topicExams.length > 1 ? 's' : ''}</div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${topicAvg >= 80 ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                                            {topicAvg >= 80 ? 'MASTER' : 'LEARNING'}
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold mb-4 group-hover:text-primary transition-colors">{decodeURIComponent(topic)}</h4>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-black">{topicAvg}%</span>
                                        <span className="text-xs text-gray-500 mb-1.5 last:hidden">avg</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
