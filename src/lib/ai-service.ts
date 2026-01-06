export interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function generateQuestions(topic: string, count: number = 5): Promise<Question[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, count })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const questionsData = await response.json();

        return questionsData.map((q: { text: string; options: string[]; correctAnswer: number; explanation: string }, i: number) => ({
            id: Date.now() + i,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
        }));

    } catch (error) {
        console.error("AI Generation failed:", error);
        // Fallback to mock on error
        return Array.from({ length: count }).map((_, i) => ({
            id: Date.now() + i,
            text: `[FALLBACK] Question ${i + 1} regarding ${topic}`,
            options: [`Option A`, `Option B`, `Option C`, `Option D`],
            correctAnswer: 0,
            explanation: `Fallback explanation due to API error. Make sure your Render backend is running!`
        }));
    }
}

export async function analyzePerformance(answers: Record<number, number>, questions: Question[]) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers, questions })
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const analysis = await response.json();

        let correctCount = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) correctCount++;
        });

        return {
            score: (correctCount / questions.length) * 100,
            feedback: analysis.feedback,
            weakAreas: analysis.weakAreas
        };

    } catch (error: unknown) {
        console.error("Analysis failed:", error);
        return {
            score: 0,
            feedback: "Analysis failed. Connecting to Render backend...",
            weakAreas: []
        };
    }
}
