import ExamInterface from '@/components/exam/ExamInterface';

export default async function ExamPage(props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { id } = await props.params;
    return (
        <div className="min-h-screen pt-20">
            <ExamInterface topic={decodeURIComponent(id)} />
        </div>
    );
}
