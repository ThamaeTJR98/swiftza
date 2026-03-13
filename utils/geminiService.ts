import { GoogleGenAI } from "@google/genai";

// Initialize the API client lazily to prevent top-level crashes
export const getSafetyTip = async (): Promise<string> => {
  try {
    // Access env var inside the function scope
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      // Fallback if no key is present
      return "Verify the vehicle registration plate against the app before entering.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give me one short, professional, single-sentence safety tip for ride-sharing in South Africa. Focus on verification or awareness.",
      config: {
          maxOutputTokens: 30,
          temperature: 0.7,
      }
    });

    return response.text?.trim() || "Always share your trip status with a trusted contact.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Ensure the driver's face matches their profile photo.";
  }
};