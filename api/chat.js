import { GoogleGenAI } from '@google/genai';

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

        const ai = new GoogleGenAI({ apiKey });

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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.status(200).json({ reply: response.text });
    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({ error: 'Failed to process the request' });
    }
}
