import OpenAI from "openai";
import Room from "../models/Room.js";
import { buildRoomCatalog, parseAIJson } from "../utils/aiHelpers.js";

const getGroq = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
};

const MODEL = "llama-3.3-70b-versatile";

const mapRecommendations = (rankings, candidates) =>
  rankings
    .map((item) => {
      const room = candidates[item.index ?? item.roomIndex];
      if (!room) return null;

      return {
        room: {
          _id: room._id,
          roomType: room.roomType,
          pricePerNight: room.pricePerNight,
          amenities: room.amenities,
          images: room.images,
        },
        hotel: {
          name: room.hotel?.name,
          city: room.hotel?.city,
          address: room.hotel?.address,
        },
        score: item.score,
        reason: item.reason,
      };
    })
    .filter(Boolean);

// ============================================================
// AI CHAT — Travel Assistant
// ============================================================

export const chatWithAI = async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const catalog = await buildRoomCatalog();

    const systemPrompt = `
You are QuickStay AI Travel Assistant.

You help users with hotel recommendations, room booking, amenities, policies, payments, and travel tips.

Available hotels in our platform (ONLY recommend from this list):
${JSON.stringify(catalog.slice(0, 30), null, 2)}

Rules:
- Be friendly, concise, and practical.
- Never invent hotels or rooms not in the catalog above.
- If asked about booking, guide them to search or pick a room from QuickStay.
- Give travel tips relevant to cities in our catalog.
`;

    const response = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    return res.json({
      success: true,
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.log("AI Chat Error:", err);
    return res.json({
      success: false,
      reply: "Sorry! AI assistant is temporarily unavailable.",
    });
  }
};

// ============================================================
// AI HOTEL RECOMMENDATION
// ============================================================

export const getAIRecommendations = async (req, res) => {
  try {
    const {
      city = "",
      budget = 99999,
      amenities = [],
      guests = 1,
    } = req.body;

    const rooms = await Room.find({ isAvailable: true }).populate("hotel");

    const candidates = rooms.filter((room) => {
      const cityMatch =
        !city ||
        room.hotel?.city?.toLowerCase().includes(city.toLowerCase());
      const budgetMatch = room.pricePerNight <= Number(budget);
      return cityMatch && budgetMatch;
    });

    if (!candidates.length) {
      return res.json({ success: true, recommendations: [] });
    }

    const roomSummary = candidates.map((room, index) => ({
      index,
      hotel: room.hotel?.name,
      city: room.hotel?.city,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      amenities: room.amenities,
    }));

    const prompt = `
Guest preferences:
City: ${city || "Any"}
Budget: ${budget}
Guests: ${guests}
Amenities: ${amenities.length ? amenities.join(", ") : "No preference"}

Rooms:
${JSON.stringify(roomSummary, null, 2)}

Return ONLY valid JSON array (max 3 items):
[{"index":0,"score":9,"reason":"Why this room fits"}]
`;

    const aiResponse = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const rankings = parseAIJson(aiResponse.choices[0].message.content) || [];

    return res.json({
      success: true,
      recommendations: mapRecommendations(rankings, candidates).slice(0, 3),
    });
  } catch (err) {
    console.log("AI Recommendation Error:", err);
    return res.json({
      success: false,
      message: "Recommendation service unavailable.",
    });
  }
};

// ============================================================
// AI SMART SEARCH
// ============================================================

export const smartSearch = async (req, res) => {
  try {
    const { query = "" } = req.body;

    if (!query.trim()) {
      return res.status(400).json({ success: false, message: "Search query required" });
    }

    const rooms = await Room.find({ isAvailable: true }).populate("hotel");
    const catalog = rooms.map((room, index) => ({
      index,
      hotel: room.hotel?.name,
      city: room.hotel?.city,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      amenities: room.amenities,
      address: room.hotel?.address,
    }));

    const prompt = `
User search query: "${query}"

Available rooms:
${JSON.stringify(catalog, null, 2)}

Interpret the natural language query and return matching room indexes ranked by relevance.
Return ONLY valid JSON:
{"matchedIndexes":[0,2,5],"interpretation":"Brief explanation of what user wanted"}
`;

    const aiResponse = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 300,
    });

    const parsed = parseAIJson(aiResponse.choices[0].message.content) || {};
    const indexes = parsed.matchedIndexes || [];

    const results = indexes
      .map((idx) => rooms[idx])
      .filter(Boolean)
      .map((room) => ({
        _id: room._id,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        amenities: room.amenities,
        images: room.images,
        hotel: room.hotel,
        createdAt: room.createdAt,
      }));

    return res.json({
      success: true,
      interpretation: parsed.interpretation || "",
      rooms: results,
    });
  } catch (err) {
    console.log("Smart Search Error:", err);
    return res.status(500).json({
      success: false,
      message: "Smart search unavailable.",
    });
  }
};

// ============================================================
// AI TRIP PLANNER
// ============================================================

export const tripPlanner = async (req, res) => {
  try {
    const {
      destination = "",
      days = 3,
      budget = 2000,
      interests = [],
      travelers = 2,
      checkInDate = "",
    } = req.body;

    const catalog = await buildRoomCatalog();
    const cityRooms = catalog.filter(
      (r) =>
        !destination ||
        r.city.toLowerCase().includes(destination.toLowerCase())
    );

    const prompt = `
Create a detailed ${days}-day trip plan for ${travelers} traveler(s).

Destination preference: ${destination || "Best match from our hotel cities"}
Budget: $${budget} total
Interests: ${interests.length ? interests.join(", ") : "General sightseeing"}
Check-in: ${checkInDate || "Flexible"}

Hotels available on QuickStay in/near destination:
${JSON.stringify(cityRooms.slice(0, 10), null, 2)}

Return ONLY valid JSON:
{
  "title": "Trip title",
  "summary": "2-3 sentence overview",
  "recommendedHotelIndex": 0,
  "estimatedBudget": {"accommodation":0,"food":0,"activities":0,"transport":0,"total":0},
  "packingList": ["item1","item2"],
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "morning": "Activity",
      "afternoon": "Activity",
      "evening": "Activity",
      "meals": "Food suggestions",
      "tips": "Local tip"
    }
  ]
}

Use recommendedHotelIndex from the hotel list above (-1 if none fit).
`;

    const aiResponse = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const plan = parseAIJson(aiResponse.choices[0].message.content);

    if (!plan) {
      return res.json({
        success: false,
        message: "Could not generate trip plan. Try again.",
      });
    }

    let recommendedRoom = null;
    if (plan.recommendedHotelIndex >= 0 && cityRooms[plan.recommendedHotelIndex]) {
      const match = cityRooms[plan.recommendedHotelIndex];
      const room = await Room.findById(match.roomId).populate("hotel");
      if (room) {
        recommendedRoom = {
          _id: room._id,
          roomType: room.roomType,
          pricePerNight: room.pricePerNight,
          images: room.images,
          hotel: {
            name: room.hotel?.name,
            city: room.hotel?.city,
            address: room.hotel?.address,
          },
        };
      }
    }

    return res.json({
      success: true,
      plan,
      recommendedRoom,
      destination: destination || cityRooms[0]?.city || "Your destination",
    });
  } catch (err) {
    console.log("Trip Planner Error:", err);
    return res.status(500).json({
      success: false,
      message: "Trip planner unavailable.",
    });
  }
};

// ============================================================
// VIBE SURPRISE — exactly 2 different destinations
// ============================================================

export const vibeSurprise = async (req, res) => {
  try {
    const { vibe = "" } = req.body;

    if (!vibe.trim()) {
      return res.status(400).json({ success: false, message: "Tell us your vibe!" });
    }

    const catalog = await buildRoomCatalog();

    const cities = [...new Set(catalog.map((r) => r.city))];

    const prompt = `
The user doesn't know where to go. They described their vibe/mood:
"${vibe}"

Available cities with QuickStay hotels: ${cities.join(", ")}

Full room catalog:
${JSON.stringify(catalog, null, 2)}

Pick EXACTLY 2 options that are TOTALLY DIFFERENT from each other (different cities, different atmosphere).
Each must use a real room from the catalog above.

Return ONLY valid JSON:
{
  "options": [
    {
      "roomIndex": 0,
      "vibeMatch": "Why this fits their mood",
      "experience": "What they'll feel/experience there",
      "highlight": "One unique thing about this pick"
    },
    {
      "roomIndex": 5,
      "vibeMatch": "...",
      "experience": "...",
      "highlight": "..."
    }
  ]
}

IMPORTANT: Return exactly 2 options, from different cities, with contrasting vibes.
`;

    const aiResponse = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 800,
    });

    const parsed = parseAIJson(aiResponse.choices[0].message.content);
    const rooms = await Room.find({ isAvailable: true }).populate("hotel");

    const options = (parsed?.options || [])
      .slice(0, 2)
      .map((opt) => {
        const room = rooms[opt.roomIndex];
        if (!room) return null;
        return {
          vibeMatch: opt.vibeMatch,
          experience: opt.experience,
          highlight: opt.highlight,
          room: {
            _id: room._id,
            roomType: room.roomType,
            pricePerNight: room.pricePerNight,
            amenities: room.amenities,
            images: room.images,
          },
          hotel: {
            name: room.hotel?.name,
            city: room.hotel?.city,
            address: room.hotel?.address,
          },
        };
      })
      .filter(Boolean);

    return res.json({
      success: true,
      options,
    });
  } catch (err) {
    console.log("Vibe Surprise Error:", err);
    return res.status(500).json({
      success: false,
      message: "Vibe surprise unavailable.",
    });
  }
};

// ============================================================
// FEATURED HOTELS (for notifications/ads)
// ============================================================

export const getFeaturedHotels = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate("hotel")
      .sort({ pricePerNight: -1 })
      .limit(5);

    const featured = rooms.map((room) => ({
      _id: room._id,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      images: room.images,
      hotel: {
        name: room.hotel?.name,
        city: room.hotel?.city,
        address: room.hotel?.address,
      },
      tagline: `Luxury ${room.roomType} in ${room.hotel?.city}`,
    }));

    return res.json({ success: true, featured });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
