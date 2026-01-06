import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

interface SearchParams {
    mode?: string;
}

export default async function AuthPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const { mode } = await searchParams;
    const initialMode = mode === 'signup' ? 'signup' : 'login';

    return (
        <div className="min-h-[80vh] flex items-center justify-center relative">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <Suspense fallback={<div className="text-white">Loading interface...</div>}>
                <AuthForm initialMode={initialMode} />
            </Suspense>
        </div>
    );
}
