import { GoogleGenAI, Type } from "@google/genai";
import { AiSuggestionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateUtmSuggestions = async (description: string): Promise<AiSuggestionResponse | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following marketing campaign description and suggest appropriate UTM parameters.
      Description: ${description}`,
      config: {
        systemInstruction: "You are a digital marketing expert. Your job is to convert natural language descriptions of marketing activities into precise, industry-standard UTM parameters (snake_case).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            source: { type: Type.STRING, description: "The referrer: (e.g. google, newsletter)" },
            medium: { type: Type.STRING, description: "Marketing medium: (e.g. cpc, banner, email)" },
            campaign: { type: Type.STRING, description: "Product, promo code, or slogan (e.g. spring_sale)" },
            term: { type: Type.STRING, description: "Identify the paid keywords" },
            content: { type: Type.STRING, description: "Use to differentiate ads" },
          },
          required: ["source", "medium", "campaign"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AiSuggestionResponse;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};