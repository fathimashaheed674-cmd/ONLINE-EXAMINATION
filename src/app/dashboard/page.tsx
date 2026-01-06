'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [generating, setGenerating] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, average: 0, loading: true });
    const [recentExams, setRecentExams] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            try {
                const q = query(
                    collection(db, `users/${user.uid}/exams`),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const total = exams.length;
                const average = total > 0
                    ? Math.round(exams.reduce((acc: number, curr: any) => acc + curr.score, 0) / total)
                    : 0;

                setStats({ total, average, loading: false });
                setRecentExams(exams.slice(0, 3));
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, [user]);

    const startExam = (topic: string) => {
        setGenerating(topic);
        router.push(`/exam/${encodeURIComponent(topic)}`);
    };

    return (
        <div className="app-container py-12 md:py-20">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black mb-3">Student Dashboard</h1>
                    <p className="text-gray-400 text-lg">Welcome back, <span className="text-primary font-bold">{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>! Ready to excel?</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/analytics" className="glass-btn px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                        📊 Full Analytics
                    </Link>
                    <button
                        onClick={() => startExam('C Programming')}
                        className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20"
                    >
                        {generating === 'C Programming' ? 'Starting...' : '+ Random Practice'}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    label="Total Exams"
                    value={stats.loading ? "..." : stats.total.toString()}
                    change={stats.total === 0 ? "Start your first!" : "Exams completed"}
                />
                <StatCard
                    label="Average Score"
                    value={stats.loading ? "..." : `${stats.average}%`}
                    change={stats.average >= 80 ? "Excellent progress!" : "Room to grow"}
                />
                <StatCard
                    label="Recent Performance"
                    value={recentExams[0] ? `${Math.round(recentExams[0].score)}%` : "-"}
                    change={recentExams[0] ? decodeURIComponent(recentExams[0].topic) : "No data yet"}
                    highlight
                />
            </div>

            {/* Recent Activity */}
            {recentExams.length > 0 && (
                <div className="mb-12 animate-fade-in">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        Recent Activity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recentExams.map((exam) => (
                            <Link key={exam.id} href={`/exam/result/${exam.id}`} className="glass-panel p-4 rounded-xl hover:bg-white/5 transition-colors border border-glass-border">
                                <div className="text-xs text-gray-500 mb-1">{new Date(exam.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                                <div className="font-semibold truncate mb-2">{decodeURIComponent(exam.topic)}</div>
                                <div className={`text-lg font-bold ${exam.score >= 80 ? 'text-success' : 'text-primary'}`}>
                                    {Math.round(exam.score)}%
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommended Exams */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold">Recommended for You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ExamCard
                        title="C Basics & Syntax"
                        duration="30 mins"
                        questions={20}
                        difficulty="Easy"
                        tags={['C', 'Programming']}
                        onStart={() => startExam('C Language Basics and Syntax')}
                        loading={generating === 'C Language Basics and Syntax'}
                    />
                    <ExamCard
                        title="Pointers & Memory"
                        duration="60 mins"
                        questions={20}
                        difficulty="Hard"
                        tags={['C', 'Memory']}
                        onStart={() => startExam('C Pointers and Memory Management')}
                        loading={generating === 'C Pointers and Memory Management'}
                    />
                    <ExamCard
                        title="Data Structures in C"
                        duration="50 mins"
                        questions={20}
                        difficulty="Medium"
                        tags={['C', 'DSA']}
                        onStart={() => startExam('Data Structures in C')}
                        loading={generating === 'Data Structures in C'}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, change, highlight }: { label: string, value: string, change: string, highlight?: boolean }) {
    return (
        <div className={`glass-panel p-6 rounded-2xl ${highlight ? 'border-primary/50 bg-primary/5' : ''}`}>
            <div className="text-gray-400 text-sm mb-2">{label}</div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className={`text-xs ${highlight ? 'text-primary' : 'text-green-400'}`}>{change}</div>
        </div>
    );
}

function ExamCard({ title, duration, questions, difficulty, tags, onStart, loading }:
    { title: string, duration: string, questions: number, difficulty: string, tags: string[], onStart: () => void, loading: boolean }) {
    return (
        <div className="glass-panel p-6 rounded-2xl hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden" onClick={onStart}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full blur-2xl"></div>
            </div>

            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                    {tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300">
                            {tag}
                        </span>
                    ))}
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${difficulty === 'Hard' ? 'border-red-500/30 text-red-400' :
                    difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400' :
                        'border-green-500/30 text-green-400'
                    }`}>
                    {difficulty}
                </span>
            </div>

            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                <span>⏱ {duration}</span>
                <span>📝 {questions} Qs</span>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onStart(); }}
                disabled={loading}
                className="block w-full text-center py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors border border-glass-border disabled:opacity-50"
            >
                {loading ? 'Generating...' : 'Start Exam'}
            </button>
        </div>
    );
}
