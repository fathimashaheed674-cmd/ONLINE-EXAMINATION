'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ChevronLeft, BarChart2, MessageSquare, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ExamResult {
    topic: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    aiFeedback?: string;
    weakAreas?: string[];
    questions: {
        id: number;
        text: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
        selectedAnswer: number | null;
    }[];
    createdAt: any;
}

export default function ResultPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(paramsPromise);
    const { user } = useAuth();
    const router = useRouter();
    const [result, setResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !id) return;

        const fetchResult = async () => {
            try {
                const docRef = doc(db, `users/${user.uid}/exams`, id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setResult(docSnap.data() as ExamResult);
                } else {
                    console.error("No such document!");
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error("Error fetching result:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [user, id, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mb-4"></div>
                <p className="text-gray-400">Loading your results...</p>
            </div>
        );
    }

    if (!result) return null;

    const scorePercentage = Math.round(result.score);
    const isPassed = scorePercentage >= 60;

    return (
        <div className="app-container py-12">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                <ChevronLeft size={20} /> Back to Dashboard
            </Link>

            <div className="glass-panel p-8 rounded-3xl mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <BarChart2 size={120} className="text-primary" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * scorePercentage) / 100} className={`${isPassed ? 'text-success' : 'text-red-500'} transition-all duration-1000 ease-out`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{scorePercentage}%</span>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold mb-2">Exam Results</h1>
                        <p className="text-gray-400 text-lg mb-4">{decodeURIComponent(result.topic)}</p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${isPassed ? 'bg-success/20 text-success border border-success/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                {isPassed ? 'PASS' : 'FAIL'}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-300 font-medium">{result.correctAnswers} / {result.totalQuestions} Correct</span>
                        </div>
                    </div>

                    <div className="md:ml-auto">
                        <Link href={`/exam/${encodeURIComponent(result.topic)}`} className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/25">
                            Retake Exam
                        </Link>
                    </div>
                </div>

                {(result.aiFeedback || result.weakAreas) && (
                    <div className="mt-8 pt-8 border-t border-glass-border relative z-10">
                        <div className="flex items-center gap-2 text-primary font-bold mb-3">
                            <BarChart2 size={18} /> AI Global Insights
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 text-gray-300 leading-relaxed italic border-l-2 border-primary/30 pl-4">
                                {result.aiFeedback || "Thinking..."}
                            </div>
                            {result.weakAreas && result.weakAreas.length > 0 && (
                                <div className="bg-white/5 p-4 rounded-xl border border-glass-border">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Target Improvement</div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.weakAreas.map((area, i) => (
                                            <span key={i} className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30">
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <MessageSquare className="text-primary" /> Question Review
                </h2>

                {result.questions.map((q, idx) => {
                    const isCorrect = q.selectedAnswer === q.correctAnswer;
                    const isUnanswered = q.selectedAnswer === null;

                    return (
                        <div key={idx} className={`glass-panel p-6 rounded-2xl border-l-4 ${isUnanswered ? 'border-l-yellow-500' : isCorrect ? 'border-l-success' : 'border-l-red-500'}`}>
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex gap-4">
                                    <span className="text-gray-500 font-mono font-bold mt-1">
                                        {idx + 1}.
                                    </span>
                                    <p className="text-lg font-medium">{q.text}</p>
                                </div>
                                {isUnanswered ? (
                                    <AlertTriangle className="text-yellow-500 shrink-0" size={24} />
                                ) : isCorrect ? (
                                    <CheckCircle className="text-success shrink-0" size={24} />
                                ) : (
                                    <XCircle className="text-red-500 shrink-0" size={24} />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                                {q.options.map((option, optIdx) => {
                                    const isCorrectOpt = optIdx === q.correctAnswer;
                                    const isSelectedOpt = optIdx === q.selectedAnswer;

                                    return (
                                        <div
                                            key={optIdx}
                                            className={`p-3 rounded-lg border text-sm transition-all ${isCorrectOpt ? 'bg-success/10 border-success text-success font-semibold' :
                                                isSelectedOpt ? 'bg-red-500/10 border-red-500/50 text-red-300' :
                                                    'bg-white/5 border-glass-border text-gray-400'
                                                }`}
                                        >
                                            <span className="inline-block w-6 font-mono text-xs opacity-50">{String.fromCharCode(65 + optIdx)}.</span>
                                            {option}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 ml-8 p-4 bg-white/5 rounded-xl border border-glass-border">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">AI Explanation</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">{q.explanation}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-16 text-center text-gray-500 text-sm">
                Generated by Gemini 1.5 Flash • {new Date(result.createdAt?.seconds * 1000).toLocaleDateString()}
            </div>
        </div>
    );
}
