import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function generateQuestions(topic: string, count: number = 5): Promise<Question[]> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not set. Using mock data.");
        // Fallback to mock if no key (for safety)
        return Array.from({ length: count }).map((_, i) => ({
            id: Date.now() + i,
            text: `[MOCK] Generated Question ${i + 1} regarding ${topic}`,
            options: [`Option A`, `Option B`, `Option C`, `Option D`],
            correctAnswer: 0,
            explanation: `Mock explanation for ${topic}`
        }));
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate ${count} multiple choice questions about "${topic}". 
        Return ONLY a raw JSON array. Do not use Markdown notation.
        Each object should have:
        - text: string (the question)
        - options: string[] (array of 4 options)
        - correctAnswer: number (0-3 index of the correct option)
        - explanation: string (brief explanation)
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const questions = JSON.parse(cleanedText);

        return questions.map((q: any, i: number) => ({
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
            explanation: `Fallback explanation due to API error.`
        }));
    }
}

export async function analyzePerformance(answers: Record<number, number>, questions: Question[]) {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        return {
            score: 0,
            feedback: "API Key missing. Cannot analyze.",
            weakAreas: []
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prepare summary
        let correctCount = 0;
        const analysisData = questions.map(q => {
            const isCorrect = answers[q.id] === q.correctAnswer;
            if (isCorrect) correctCount++;
            return {
                question: q.text,
                isCorrect,
                topic: "General" // Ideally we'd have subtopics
            };
        });

        const score = (correctCount / questions.length) * 100;

        const prompt = `Analyze this quiz performance:
        ${JSON.stringify(analysisData)}
        
        Return a JSON object with:
        - feedback: string (encouraging feedback and critique)
        - weakAreas: string[] (list of topics to improve)
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(text);

        return {
            score,
            feedback: analysis.feedback,
            weakAreas: analysis.weakAreas
        };

    } catch (error) {
        console.error("Analysis failed:", error);
        return {
            score: 0,
            feedback: "Analysis failed.",
            weakAreas: []
        };
    }
}
