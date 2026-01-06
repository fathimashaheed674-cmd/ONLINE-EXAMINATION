import ExamInterface from '@/components/exam/ExamInterface';

export default async function ExamPage(props: any) {
    const params = await props.params;
    const { id } = params as { id: string };

    return (
        <div className="min-h-screen pt-20">
            <ExamInterface topic={decodeURIComponent(id)} />
        </div>
    );
}
