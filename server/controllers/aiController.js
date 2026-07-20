import OpenAI from "openai";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";

// ============================================================
// GROQ CLIENT
// ============================================================

const getGroq = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
};

// ============================================================
// AI CHAT
// ============================================================

export const chatWithAI = async (req, res) => {
  try {
    const { messages = [] } = req.body;

    const systemPrompt = `
You are QuickStay AI.

You are a helpful hotel booking assistant.

Help users with:
- hotel recommendations
- room booking
- amenities
- booking policies
- payment queries
- travel tips

Keep answers friendly and concise.
Never invent hotel information.
`;

    const response = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],

      temperature: 0.7,
      max_tokens: 300,
    });

    return res.json({
      success: true,
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.log("AI Chat Error:", err);

    return res.json({
      success: false,
      reply:
        "Sorry! AI assistant is temporarily unavailable.",
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
      checkInDate,
      checkOutDate,
    } = req.body;

    const rooms = await Room.find({
      isAvailable: true,
    }).populate("hotel");

    if (!rooms.length) {
      return res.json({
        success: true,
        recommendations: [],
      });
    }

    const candidates = rooms.filter((room) => {
      const cityMatch =
        !city ||
        room.hotel?.city
          ?.toLowerCase()
          .includes(city.toLowerCase());

      const budgetMatch =
        room.pricePerNight <= Number(budget);

      return cityMatch && budgetMatch;
    });

    if (!candidates.length) {
      return res.json({
        success: true,
        recommendations: [],
      });
    }

    const roomSummary = candidates.map((room, index) => ({
      index,

      hotel: room.hotel?.name,

      city: room.hotel?.city,

      roomType: room.roomType,

      address: room.hotel?.address,

      pricePerNight: room.pricePerNight,

      amenities: room.amenities,
    }));

    const prompt = `
A guest wants a hotel.

City:
${city || "Any"}

Budget:
${budget}

Guests:
${guests}

Amenities:
${amenities.length ? amenities.join(", ") : "No preference"}

Available Rooms:

${JSON.stringify(roomSummary, null, 2)}

Return ONLY valid JSON.

Example:

[
 {
   "index":0,
   "score":9,
   "reason":"Best overall value."
 }
]
`;

    const aiResponse = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.3,

      max_tokens: 400,
    });

    let rankings = [];

    try {
      rankings = JSON.parse(
        aiResponse.choices[0].message.content
      );
    } catch {
      rankings = [];
    }

    const recommendations = rankings
      .map((item) => {
        const room = candidates[item.index];

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

    return res.json({
      success: true,
      recommendations,
    });
  } catch (err) {
    console.log("AI Recommendation Error:", err);

    return res.json({
      success: false,
      message: "Recommendation service unavailable.",
    });
  }
};