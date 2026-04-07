const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Summarize task description using Google Gemini
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @returns {Promise<string>} - AI generated summary
 */
const summarizeTask = async (title, description) => {
    try {
        if (!description || description.trim().length < 20) {
            return 'Description is too short to summarize.';
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
You are a professional task management assistant.
Summarize the following task in 1-2 concise sentences.
Focus on what needs to be done and why it matters.
Keep it under 100 words.

Task Title: ${title}
Task Description: ${description}

Respond with only the summary, no extra text.
    `.trim();

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text().trim();

        return summary;
    } catch (err) {
        console.error('Gemini AI error:', err.message);

        // Graceful fallback — don't crash the app
        if (err.message?.includes('API_KEY')) {
            throw new Error('AI service configuration error. Please check API key.');
        }
        if (err.message?.includes('quota')) {
            throw new Error('AI quota exceeded. Please try again later.');
        }

        throw new Error('AI summarization failed. Please try again.');
    }
};

/**
 * Generate smart task suggestions based on project context
 * @param {string} projectContext
 * @returns {Promise<string[]>}
 */
const suggestTasks = async (projectContext) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
You are a project management expert.
Based on this project context, suggest 5 actionable tasks.
Return ONLY a JSON array of strings, no markdown, no explanation.

Context: ${projectContext}

Example format: ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"]
    `.trim();

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Parse JSON safely
        const cleaned = text.replace(/```json|```/g, '').trim();
        const suggestions = JSON.parse(cleaned);

        return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
    } catch (err) {
        console.error('Task suggestion error:', err.message);
        throw new Error('Could not generate task suggestions.');
    }
};

module.exports = { summarizeTask, suggestTasks };