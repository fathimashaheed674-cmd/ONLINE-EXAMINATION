export interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function generateQuestions(topic: string, count: number = 20): Promise<Question[]> {
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
        // Fallback to C programming questions
        const cQuestions = [
            {
                text: "What is the correct syntax to declare a pointer to an integer in C?",
                options: ["int *ptr;", "int ptr*;", "*int ptr;", "pointer int ptr;"],
                correctAnswer: 0,
                explanation: "The asterisk (*) before the variable name declares it as a pointer to an integer."
            },
            {
                text: "What does the 'sizeof' operator return?",
                options: ["Size in bits", "Size in bytes", "Size in kilobytes", "Number of elements"],
                correctAnswer: 1,
                explanation: "sizeof returns the size of a variable or data type in bytes."
            },
            {
                text: "Which function is used to allocate memory dynamically in C?",
                options: ["alloc()", "malloc()", "new()", "memory()"],
                correctAnswer: 1,
                explanation: "malloc() is the standard library function for dynamic memory allocation in C."
            },
            {
                text: "What is the output of: printf(\"%d\", 5/2);",
                options: ["2.5", "2", "3", "Error"],
                correctAnswer: 1,
                explanation: "Integer division in C truncates the decimal part, so 5/2 = 2."
            },
            {
                text: "Which header file is required to use printf()?",
                options: ["<stdlib.h>", "<stdio.h>", "<string.h>", "<conio.h>"],
                correctAnswer: 1,
                explanation: "stdio.h (standard input/output) contains the declaration for printf()."
            },
            {
                text: "What does NULL represent in C?",
                options: ["Empty string", "Zero value", "Null pointer", "Undefined"],
                correctAnswer: 2,
                explanation: "NULL is a macro that represents a null pointer constant."
            },
            {
                text: "Which of the following is NOT a valid C variable name?",
                options: ["_variable", "variable123", "123variable", "variable_name"],
                correctAnswer: 2,
                explanation: "Variable names in C cannot start with a digit."
            },
            {
                text: "What is the range of 'char' data type in C?",
                options: ["0 to 255", "-128 to 127", "-32768 to 32767", "Depends on compiler"],
                correctAnswer: 3,
                explanation: "The range of char depends on whether it's signed or unsigned and the compiler implementation."
            },
            {
                text: "Which loop is guaranteed to execute at least once?",
                options: ["for loop", "while loop", "do-while loop", "None"],
                correctAnswer: 2,
                explanation: "do-while loop checks the condition after executing the body, so it runs at least once."
            },
            {
                text: "What is the purpose of the 'break' statement?",
                options: ["Exit program", "Exit loop", "Skip iteration", "Pause execution"],
                correctAnswer: 1,
                explanation: "break terminates the nearest enclosing loop or switch statement."
            },
            {
                text: "How do you declare a constant in C?",
                options: ["constant int x;", "const int x;", "int constant x;", "final int x;"],
                correctAnswer: 1,
                explanation: "The 'const' keyword is used to declare constants in C."
            },
            {
                text: "What is the correct way to comment in C?",
                options: ["# This is a comment", "/* This is a comment */", "// This is a comment", "Both B and C"],
                correctAnswer: 3,
                explanation: "C supports both /* */ for multi-line and // for single-line comments (C99 onwards)."
            },
            {
                text: "Which function is used to compare two strings in C?",
                options: ["compare()", "strcmp()", "strcompare()", "equals()"],
                correctAnswer: 1,
                explanation: "strcmp() from string.h compares two strings lexicographically."
            },
            {
                text: "What is the default return type of main() function?",
                options: ["void", "int", "float", "char"],
                correctAnswer: 1,
                explanation: "The main() function returns an integer value to the operating system."
            },
            {
                text: "Which operator is used to access a structure member using a pointer?",
                options: [".", "*", "->", "&"],
                correctAnswer: 2,
                explanation: "The arrow operator (->) is used to access structure members via a pointer."
            },
            {
                text: "What does the '&' operator do in C?",
                options: ["Bitwise AND", "Logical AND", "Address of", "Both A and C"],
                correctAnswer: 3,
                explanation: "& can be used for both bitwise AND operation and getting the address of a variable."
            },
            {
                text: "Which function is used to free dynamically allocated memory?",
                options: ["delete()", "free()", "remove()", "dealloc()"],
                correctAnswer: 1,
                explanation: "free() is used to release memory allocated by malloc/calloc/realloc."
            },
            {
                text: "What is the output of: printf(\"%d\", ++x) if x=5?",
                options: ["5", "6", "7", "Error"],
                correctAnswer: 1,
                explanation: "++x is pre-increment, so x becomes 6 before being printed."
            },
            {
                text: "Which storage class has the longest lifetime?",
                options: ["auto", "static", "register", "extern"],
                correctAnswer: 1,
                explanation: "static variables persist for the entire program execution."
            },
            {
                text: "What is a dangling pointer?",
                options: ["NULL pointer", "Pointer to freed memory", "Uninitialized pointer", "Invalid pointer"],
                correctAnswer: 1,
                explanation: "A dangling pointer points to memory that has been freed or deallocated."
            }
        ];

        return cQuestions.slice(0, count).map((q, i) => ({
            id: Date.now() + i,
            ...q
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
