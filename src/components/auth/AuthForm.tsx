'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AuthForm({ initialMode = 'login' }: { initialMode?: 'login' | 'signup' }) {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const toggleMode = () => {
        setMode(prev => prev === 'login' ? 'signup' : 'login');
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            router.push('/dashboard');
        } catch (err: unknown) {
            const errorInstance = err as Error;
            console.error(errorInstance);
            setError(errorInstance.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-8 rounded-2xl w-full max-w-md relative overflow-hidden">
            <h2 className="text-3xl font-bold mb-6 text-center">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
                            placeholder="John Doe"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
                        placeholder="john@example.com"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all mt-6 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
                <p>
                    {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={toggleMode} className="text-primary hover:text-blue-400 font-medium ml-1">
                        {mode === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>

            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-accent/20 rounded-full blur-3xl -z-10"></div>
        </div>
    );
}
