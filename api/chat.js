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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });

        const prompt = `
You are a news analysis chatbot.
The user is asking about the following news title or topic: "${message}"

Analyze this news topic and provide a detailed summary. 
Specifically, format your answer strictly into these sections:
1. **Summary**: A brief overview.
2. **Positive Points**: List the positive aspects.
3. **Negative Points**: List the negative aspects.
4. **Conclusion**: A final overall conclusion.

If you cannot find exact news, give a general analysis based on the topic. Provide the output in markdown.
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
