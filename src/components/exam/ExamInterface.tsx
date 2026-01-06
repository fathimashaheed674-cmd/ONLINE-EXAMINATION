'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowLeft, Flag, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateQuestions, Question, analyzePerformance } from '@/lib/ai-service';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ExamInterface({ topic }: { topic: string }) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const data = await generateQuestions(topic);
                setQuestions(data);
            } catch (error) {
                console.error("Failed to load questions", error);
            } finally {
                setLoading(false);
            }
        };

        if (topic) {
            fetchQuestions();
        }
    }, [topic]);

    const handleSubmit = useCallback(async () => {
        if (!user || submitting) return;

        setSubmitting(true);
        try {
            const aiAnalysis = await analyzePerformance(answers, questions);

            const docRef = await addDoc(collection(db, `users/${user.uid}/exams`), {
                topic,
                score: aiAnalysis.score,
                totalQuestions: questions.length,
                correctAnswers: Math.round((aiAnalysis.score / 100) * questions.length),
                aiFeedback: aiAnalysis.feedback,
                weakAreas: aiAnalysis.weakAreas,
                questions: questions.map(q => ({
                    ...q,
                    selectedAnswer: answers[q.id] || null
                })),
                createdAt: serverTimestamp()
            });

            // Also update global leaderboard
            await addDoc(collection(db, 'leaderboard'), {
                userId: user.uid,
                name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                score: aiAnalysis.score,
                topic,
                createdAt: serverTimestamp(),
                avatar: user.photoURL || user.email?.charAt(0).toUpperCase() || '?'
            });

            router.push(`/exam/result/${docRef.id}`);
        } catch (error) {
            console.error("Error submitting exam:", error);
            alert("Failed to submit exam. Please try again.");
            setSubmitting(false);
        }
    }, [user, submitting, answers, questions, topic, router]);

    useEffect(() => {
        if (loading || submitting) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, submitting, handleSubmit]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-xl text-gray-400 animate-pulse">Generating AI Questions for &quot;{topic}&quot;...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <p className="text-xl text-red-400">Failed to load questions. Please try again.</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-primary rounded-lg text-white">Retry</button>
            </div>
        );
    }

    const currentQ = questions[currentQIndex];
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
        <div className="app-container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Exam Area */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Header */}
                    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Current Topic</h2>
                            <p className="text-xl font-bold">{decodeURIComponent(topic)}</p>
                        </div>
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 ${timeLeft < 300 ? 'border-red-500/50 bg-red-500/10 text-red-500 animate-pulse' : 'border-glass-border bg-white/5'}`}>
                            <Clock size={20} />
                            <span className="text-2xl font-mono font-bold">
                                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="glass-panel p-10 rounded-3xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <span className="text-gray-500 font-mono font-bold text-lg">Question {currentQIndex + 1} / {questions.length}</span>
                            <button
                                onClick={() => {
                                    const next = new Set(flagged);
                                    if (next.has(currentQ.id)) next.delete(currentQ.id);
                                    else next.add(currentQ.id);
                                    setFlagged(next);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${flagged.has(currentQ.id) ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Flag size={18} fill={flagged.has(currentQ.id) ? "currentColor" : "none"} />
                                {flagged.has(currentQ.id) ? 'Flagged' : 'Flag for later'}
                            </button>
                        </div>

                        <h3 className="text-2xl font-semibold mb-10 leading-relaxed">
                            {currentQ.text}
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {currentQ.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setAnswers({ ...answers, [currentQ.id]: idx })}
                                    className={`group flex items-center p-5 rounded-2xl border-2 transition-all text-left ${answers[currentQ.id] === idx
                                        ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                        : 'border-glass-border bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
                                >
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold mr-4 transition-colors ${answers[currentQ.id] === idx ? 'bg-primary text-white' : 'bg-white/5 text-gray-500 group-hover:bg-white/10'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className={`text-lg transition-colors ${answers[currentQ.id] === idx ? 'text-white' : 'text-gray-300'}`}>
                                        {option}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQIndex === 0}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-glass-border transition-all disabled:opacity-30"
                        >
                            <ArrowLeft size={20} /> Previous
                        </button>

                        {currentQIndex === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-success hover:bg-green-600 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg shadow-success/20 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Finish Exam'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-blue-600 font-bold transition-all shadow-lg shadow-primary/20"
                            >
                                Next <ArrowRight size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 rounded-2xl sticky top-24">
                        <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Question Inspector</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {questions.map((q, idx) => {
                                const isAnswered = answers[q.id] !== undefined;
                                const isCurrent = currentQIndex === idx;
                                const isFlagged = flagged.has(q.id);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQIndex(idx)}
                                        className={`w-full aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all border-2 relative
                                            ${isCurrent ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}
                                            ${isAnswered ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}
                                            ${isFlagged && !isAnswered ? 'bg-orange-500/20 text-orange-400' : ''}
                                        `}
                                    >
                                        {idx + 1}
                                        {isFlagged && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-[#0a0a0a]"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-8 border-t border-glass-border space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Answered</span>
                                <span className="font-bold">{Object.keys(answers).length} / {questions.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Flagged</span>
                                <span className="font-bold text-orange-400">{flagged.size}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full mt-8 py-4 rounded-xl border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                        >
                            Submit Application
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
