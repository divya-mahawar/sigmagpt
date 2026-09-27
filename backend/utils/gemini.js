import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const getGeminiAPIResponse = async (message) => {

    try {

        const response = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: message
        });

        return response.output_text;

    }
    catch (err) {
    console.error(
        "Gemini API Error:",
        err.status || err.code || err.message
    );

    if (err.status === 429 || err.code === 429) {
        const rateLimitError = new Error(
            "AI service rate limit exceeded."
        );

        rateLimitError.status = 429;

        throw rateLimitError;
    }

    throw err;
}
};

export default getGeminiAPIResponse;