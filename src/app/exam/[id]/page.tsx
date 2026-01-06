import ExamInterface from '@/components/exam/ExamInterface';

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="min-h-screen pt-20">
            <ExamInterface topic={decodeURIComponent(id)} />
        </div>
    );
}
