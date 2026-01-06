const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Route: Health Check
app.get('/', (req, res) => {
    res.send('AI Exam Backend is Running!');
});

// Route: Generate Questions
app.post('/api/generate', async (req, res) => {
    const { topic, count = 5 } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
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
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(text);

        res.json(questions);
    } catch (error) {
        console.error("AI Generation failed:", error);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});

// Route: Analyze Performance
app.post('/api/analyze', async (req, res) => {
    const { answers, questions } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const analysisData = questions.map(q => ({
            question: q.text,
            isCorrect: answers[q.id] === q.correctAnswer,
            topic: "General"
        }));

        const prompt = `Analyze this quiz performance:
        ${JSON.stringify(analysisData)}
        
        Return a JSON object with:
        - feedback: string (encouraging feedback and critique)
        - weakAreas: string[] (list of topics to improve)
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(text);

        res.json(analysis);
    } catch (error) {
        console.error("Analysis failed:", error);
        res.status(500).json({ error: 'Failed to analyze performance' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
