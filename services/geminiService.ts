import { GoogleGenAI } from "@google/genai";
import { Coordinates, Restaurant, Category } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchRecommendations = async (
  coords: Coordinates
): Promise<Restaurant[]> => {
  const modelId = "gemini-2.5-flash"; // Using 2.5 flash for speed and tool support

  const prompt = `
    I am at latitude: ${coords.latitude}, longitude: ${coords.longitude}.
    Please act as a local dining expert. I need a list of at least 15-20 excellent dinner restaurants within a 2km radius.
    
    Please include a diverse mix of these categories:
    - Hot Pot (火鍋)
    - Japanese (日式料理)
    - Western/Steak (西式/牛排)
    - Chinese (中式合菜)
    - BBQ (燒肉/烤肉)

    For each restaurant, please provide the following details in a STRICT JSON format inside a code block:
    - name: Restaurant name.
    - category: One of the categories listed above.
    - rating: Google rating (number, e.g., 4.5).
    - reviewCount: Approximate number of reviews.
    - address: Address string.
    - description: Short appetizing description (1 sentence).
    - topReview: A summary or text of the most helpful/liked positive review.
    - otherReviews: An array of strings containing 2 other summary points from reviews.
    - websiteUrl: Official website URL (if available, otherwise null).
    - reservationUrl: Online booking URL (e.g., inline apps, opentable, or local equivalents, otherwise null).

    CRITICAL: You MUST use the Google Maps tool to verify the existence, rating, and location of these places.
    Output the JSON array inside a markdown code block labeled 'json'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: coords.latitude,
              longitude: coords.longitude
            }
          }
        },
        // We cannot use responseSchema with googleMaps tool, so we parse text manually
        temperature: 0.4, 
      },
    });

    const text = response.text || "";
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    
    if (!jsonMatch) {
      console.error("Failed to parse JSON from Gemini response", text);
      // Fallback: Return empty array to trigger UI 'no results' or error
      return [];
    }

    const rawData = JSON.parse(jsonMatch[1]);
    
    // Process and map data to our interface
    // Note: We also check groundingChunks for real map URLs if possible, 
    // but typically the model includes them if asked or we construct a search link.
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Helper to find a map link in grounding chunks matching the restaurant name
    // This is a best-effort matching
    const findMapLink = (name: string) => {
      const chunk = groundingChunks.find((c: any) => 
        c.web?.title?.includes(name) || c.maps?.title?.includes(name)
      );
      return chunk?.maps?.uri || chunk?.web?.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
    };

    const restaurants: Restaurant[] = rawData.map((item: any, index: number) => ({
      id: `rest-${index}-${Date.now()}`,
      name: item.name,
      category: mapCategory(item.category),
      rating: item.rating || 0,
      reviewCount: item.reviewCount || 0,
      address: item.address,
      topReview: item.topReview || "暫無評論摘要",
      otherReviews: item.otherReviews || [],
      websiteUrl: item.websiteUrl,
      reservationUrl: item.reservationUrl,
      googleMapsUrl: findMapLink(item.name),
      description: item.description
    }));

    return restaurants;

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};

const mapCategory = (rawCat: string): Category => {
  if (rawCat.includes("火鍋")) return Category.HOT_POT;
  if (rawCat.includes("日式") || rawCat.includes("壽司") || rawCat.includes("拉麵")) return Category.JAPANESE;
  if (rawCat.includes("西式") || rawCat.includes("牛排") || rawCat.includes("義大利")) return Category.WESTERN;
  if (rawCat.includes("中式") || rawCat.includes("台菜") || rawCat.includes("合菜")) return Category.CHINESE;
  if (rawCat.includes("燒肉") || rawCat.includes("烤肉")) return Category.BBQ;
  return Category.OTHER;
};