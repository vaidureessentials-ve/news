/* global process */
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1' });

        const prompt = `
You are a helpful and intelligent news and strategic intelligence assistant for GFS (Global Font of Strategic intelligence).

Your goals:
1. Be friendly and conversational. If the user greets you (e.g., "Hi", "Hello", "How are you?"), respond warmly and ask how you can help them with news or analysis today.
2. If the user asks about a specific news topic, title, or event, provide a professional and structured analysis.
3. If providing news analysis, format your answer strictly into these sections:
   - **Summary**: A brief overview of the situation.
   - **Positive Points**: List the positive aspects or implications.
   - **Negative Points**: List the negative aspects or risks.
   - **Conclusion**: A final strategic synthesis.
4. Maintain a professional yet approachable tone. If you don't know something, be honest but provide related context if possible.

User message: "${message}"

Provide your output in markdown.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({
            error: error.message || 'Failed to process the request',
            details: error.toString()
        });
    }
}
