
import { GoogleGenAI } from "@google/genai";
import { ParkingSpot } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Uses Gemini 2.5 to find the best parking spots based on a natural language query.
 * Adheres to rules: No responseMimeType/responseSchema when using googleMaps tool.
 */
export const getSmartRecommendations = async (query: string, spots: ParkingSpot[]) => {
  const spotsContext = spots.map(s => ({
    id: s.id,
    title: s.title,
    price: s.pricePerHour,
    address: s.address,
    type: s.type
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `User search: "${query}". 
    Our spots: ${JSON.stringify(spotsContext)}.
    Identify which spots match. Return your answer as a raw JSON array of objects with "spotId" and "reason" fields.
    Format example: [{"spotId": "1", "reason": "Close to the stadium"}]
    Do not include any other text, only the JSON.`,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });

  try {
    // Extract JSON from potential Markdown response
    const text = response.text || '[]';
    const jsonMatch = text.match(/\[.*\]/s);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanedJson);
  } catch (e) {
    console.error("Gemini recommendation failed:", e);
    return [];
  }
};

export const generateListingDescription = async (details: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a 2-3 sentence catchy description for a ${details.type} parking spot at ${details.address}. Mention these features: ${details.features?.join(', ') || 'convenient location'}.`,
  });
  return response.text;
};

export const suggestPrice = async (location: string, type: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a competitive hourly parking price (number only) for a ${type} in ${location}.`,
  });
  const price = parseFloat(response.text?.replace(/[^0-9.]/g, '') || '15');
  return isNaN(price) ? 15 : price;
};
