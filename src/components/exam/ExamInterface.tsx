'use client';

import { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (loading) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit(); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSelect = (optionIndex: number) => {
        if (!questions[currentQIndex]) return;
        setAnswers(prev => ({ ...prev, [questions[currentQIndex].id]: optionIndex }));
    };

    const toggleFlag = () => {
        if (!questions[currentQIndex]) return;
        const qId = questions[currentQIndex].id;
        setFlagged(prev => {
            const next = new Set(prev);
            if (next.has(qId)) next.delete(qId);
            else next.add(qId);
            return next;
        });
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            // Calculate Score
            let correctCount = 0;
            questions.forEach(q => {
                if (answers[q.id] === q.correctAnswer) {
                    correctCount++;
                }
            });
            const score = (correctCount / questions.length) * 100;

            // Get AI Analysis
            let aiAnalysis = { feedback: '', weakAreas: [] as string[] };
            try {
                aiAnalysis = await analyzePerformance(answers, questions);
            } catch (err) {
                console.error("AI Analysis failed:", err);
            }

            // Save to Firestore
            let examId = '';
            if (user) {
                // Save attempt with detailed data
                const docRef = await addDoc(collection(db, `users/${user.uid}/exams`), {
                    topic,
                    score,
                    totalQuestions: questions.length,
                    correctAnswers: correctCount,
                    aiFeedback: aiAnalysis.feedback,
                    weakAreas: aiAnalysis.weakAreas,
                    questions: questions.map(q => ({
                        id: q.id,
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        selectedAnswer: answers[q.id] ?? null
                    })),
                    createdAt: serverTimestamp(),
                });
                examId = docRef.id;

                // Update Leaderboard
                await addDoc(collection(db, 'leaderboard'), {
                    uid: user.uid,
                    name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                    score,
                    topic,
                    createdAt: serverTimestamp(),
                    avatar: (user.displayName || 'A').charAt(0).toUpperCase()
                });
            }

            // Redirect to results
            if (examId) {
                router.push(`/exam/result/${examId}`);
            } else {
                router.push('/dashboard?examSubmitted=true');
            }
        } catch (error) {
            console.error("Error submitting exam:", error);
            alert("Failed to submit exam. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-xl text-gray-400 animate-pulse">Generating AI Questions for "{topic}"...</p>
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

    const currentQuestion = questions[currentQIndex];

    return (
        <div className="flex h-[calc(100vh-80px)]">
            {/* Main Question Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Question {currentQIndex + 1}</h2>
                        <div className="flex items-center gap-4 text-gray-400">
                            <button onClick={toggleFlag} className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${flagged.has(currentQuestion.id) ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-gray-700 hover:border-gray-500'}`}>
                                <Flag size={16} /> Mark for Review
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-2xl mb-8 min-h-[200px] flex items-center">
                        <p className="text-xl font-medium leading-relaxed">
                            {currentQuestion.text}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${answers[currentQuestion.id] === idx
                                    ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                    : 'border-glass-border bg-glass-bg hover:bg-white/5 text-gray-300'
                                    }`}
                            >
                                <span className="inline-block w-8 font-mono text-gray-500">{String.fromCharCode(65 + idx)}.</span>
                                {option}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between mt-12">
                        <button
                            onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQIndex === 0}
                            className="glass-btn px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft size={18} /> Previous
                        </button>

                        {currentQIndex < questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentQIndex(prev => prev + 1)}
                                className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/25 transition-all"
                            >
                                Next <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-success hover:bg-emerald-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-success/25 transition-all disabled:opacity-70"
                            >
                                {submitting ? 'Submitting...' : 'Submit Exam'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar / Navigator */}
            <div className="w-80 border-l border-glass-border bg-glass-bg p-6 flex flex-col">
                <div className="mb-8 p-4 rounded-xl bg-white/5 border border-glass-border flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Time Remaining</span>
                    <div className="text-xl font-mono font-bold text-primary flex items-center gap-2">
                        <Clock size={16} /> {formatTime(timeLeft)}
                    </div>
                </div>

                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Question Inspector</h3>
                <div className="grid grid-cols-5 gap-3">
                    {questions.map((q, idx) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isCurrent = currentQIndex === idx;
                        const isFlagged = flagged.has(q.id);

                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQIndex(idx)}
                                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold border transition-all ${isCurrent ? 'border-primary bg-primary text-white shadow-lg' :
                                    isFlagged ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500' :
                                        isAnswered ? 'border-success/50 bg-success/20 text-success' :
                                            'border-glass-border bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {idx + 1}
                                {isFlagged && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-500 rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
