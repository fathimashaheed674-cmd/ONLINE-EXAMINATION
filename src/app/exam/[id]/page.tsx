import ExamInterface from '@/components/exam/ExamInterface';

export default function ExamPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen pt-20">
            <ExamInterface topic={decodeURIComponent(params.id)} />
        </div>
    );
}
