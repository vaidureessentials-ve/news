import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_NEW_STABLE_KEY_HERE')) {
        console.error('Please set a valid GEMINI_API_KEY in .env');
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const message = "Hello";
        const prompt = `You are a news analyst. Help me with: ${message}`;

        console.log('Sending request...');
        // The SDK usually expects 'contents' to be an array of objects for multi-modal/chat history
        // or a simple structure for single prompts.
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        console.log('Response status:', response.status);
        console.log('Full Response:', JSON.stringify(response, null, 2));
        console.log('Text Reply:', response.text);
    } catch (error) {
        console.error('Error details:', error);
    }
}

test();
