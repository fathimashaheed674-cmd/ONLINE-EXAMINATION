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

        const prompt = `You are an expert C programming instructor. Generate ${count} multiple choice questions about "${topic}". 
        
        Requirements:
        - Focus ONLY on C programming language concepts
        - Include code snippets where appropriate
        - Questions should test practical understanding, not just theory
        - Cover topics like: syntax, pointers, memory management, data structures, functions, arrays, strings
        - Make questions challenging but fair for intermediate level
        
        Return ONLY a raw JSON array (no markdown formatting, no code blocks).
        Each object must have exactly these fields:
        {
          "text": "Clear question text (can include code)",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,  // index 0-3
          "explanation": "Brief explanation of the correct answer"
        }
        
        Example question format:
        "What is the output of the following C code?\n\nint x = 5;\nprintf(\"%d\", ++x);"
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
