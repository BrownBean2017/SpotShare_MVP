
import { GoogleGenAI } from "@google/genai";
import { ParkingSpot } from "../types";

// The API key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Uses Gemini to find the best parking spots based on a natural language query.
 */
export const getSmartRecommendations = async (query: string, spots: ParkingSpot[]) => {
  const spotsContext = spots.map(s => ({
    id: s.id,
    title: s.title,
    price: s.pricePerHour,
    address: s.address,
    type: s.type
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a parking assistant. A user is looking for: "${query}". 
      Available spots: ${JSON.stringify(spotsContext)}.
      
      Return a JSON array of objects with "spotId" and "reason". 
      "reason" should be a short, encouraging sentence explaining the match.
      Example: [{"spotId": "1", "reason": "Perfect location for your commute!"}]
      Return ONLY the raw JSON array.`,
    });

    const text = response.text || '[]';
    const jsonMatch = text.match(/\[.*\]/s);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanedJson);
  } catch (e) {
    console.error("AI Recommendation failed:", e);
    return [];
  }
};

export const generateListingDescription = async (details: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a high-converting 2-sentence description for a ${details.type} at ${details.address}. Focus on safety and convenience.`,
    });
    return response.text || "A great parking spot in a convenient location.";
  } catch (e) {
    return "A secure and convenient parking space.";
  }
};

export const suggestPrice = async (location: string, type: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a competitive hourly parking price for a ${type} in ${location}. Return ONLY the number.`,
    });
    const price = parseFloat(response.text?.replace(/[^0-9.]/g, '') || '12');
    return isNaN(price) ? 12 : price;
  } catch (e) {
    return 12;
  }
};
