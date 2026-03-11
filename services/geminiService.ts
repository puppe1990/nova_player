
import { GoogleGenAI } from "@google/genai";

// Function to analyze a video frame using Gemini
export const analyzeVideoFrame = async (base64Image: string, prompt: string): Promise<string> => {
  // Always initialize right before use as per guidelines to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1],
            },
          },
          { text: prompt },
        ],
      },
    });

    // Directly access the text property as per latest SDK property definition
    return response.text || "Desculpe, não consegui analisar este frame.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Erro ao conectar com a IA. Verifique sua chave de API.";
  }
};
