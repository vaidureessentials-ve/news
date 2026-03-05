import { GoogleGenAI } from '@google/genai';

async function testApiKey() {
    const apiKey = "AIzaSyDvzRK1Zf06mUL5vphJgKESJb0TfQbQTYU";

    console.log("Testing API key...");

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Say hello world!',
        });

        console.log("Success! Response: ", response.text);
    } catch (error) {
        console.error("Failed to generate content:");
        console.error(error);
    }
}

testApiKey();
