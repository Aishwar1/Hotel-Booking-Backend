import OpenAI from "openai";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";

// ============================================================
// AI CONTROLLER  (NEW)
// ============================================================
// Two AI-powered endpoints:
//
//  1. POST /api/ai/chat
//     General hotel assistant chatbot. Answers questions about
//     QuickStay, booking policies, amenities, etc.
//
//  2. POST /api/ai/recommend
//     Smart hotel recommender.  The client sends a user's
//     preferences (city, budget, amenities they want) and we
//     fetch the matching rooms from the DB, then ask the AI to
//     rank and explain the best matches.
//
// Both use the OpenAI API (set OPENAI_API_KEY in Replit Secrets).
//
// NOTE: OpenAI client is created lazily inside each function so
// the server starts cleanly even before the key is configured.
// ============================================================

// Lazy getter — only constructs the client when a request arrives.
const getOpenAI = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not set. Add it to Replit Secrets.");
    }
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// ---- POST /api/ai/chat ----
// Body: { messages: [{role, content}] }
// Returns: { reply: "..." }
export const chatWithAI = async (req, res) => {
    try {
        const { messages = [] } = req.body;

        const systemPrompt = `You are QuickStay AI — a friendly and knowledgeable hotel booking assistant
for the QuickStay platform. Help users find rooms, understand booking policies,
answer questions about amenities, and guide them through the reservation process.
Keep responses concise (2-4 sentences max) and conversational.
If a user asks about specific availability, tell them to use the booking form on the room page.
Do not make up room details; stick to what you know about QuickStay as a platform.`;

        const response = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",        // Affordable and fast
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
            max_tokens: 300,
            temperature: 0.7,
        });

        const reply = response.choices[0].message.content;
        res.json({ success: true, reply });
    } catch (error) {
        console.error("AI chat error:", error.message);
        res.json({
            success: false,
            reply: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        });
    }
};

// ---- POST /api/ai/recommend ----
// Body: { city, budget, amenities, guests, checkInDate, checkOutDate }
// Returns: { recommendations: [{room, hotel, score, reason}] }
export const getAIRecommendations = async (req, res) => {
    try {
        const {
            city = "",
            budget = 9999,
            amenities = [],
            guests = 1,
            checkInDate,
            checkOutDate,
        } = req.body;

        // Step 1: Fetch all rooms with their hotel data from the database
        const rooms = await Room.find({ isAvailable: true }).populate("hotel");

        if (!rooms.length) {
            return res.json({ success: true, recommendations: [], message: "No rooms available" });
        }

        // Step 2: Pre-filter locally for speed (don't send irrelevant data to the AI)
        const candidates = rooms.filter((room) => {
            const matchesCity = !city || room.hotel?.city?.toLowerCase().includes(city.toLowerCase());
            const matchesBudget = room.pricePerNight <= Number(budget);
            return matchesCity && matchesBudget;
        });

        if (!candidates.length) {
            return res.json({
                success: true,
                recommendations: [],
                message: "No rooms match your filters. Try adjusting your budget or city.",
            });
        }

        // Step 3: Build a concise summary of candidates for the AI to reason over
        const roomSummaries = candidates.map((room, i) => ({
            index: i,
            id: room._id,
            hotel: room.hotel?.name,
            city: room.hotel?.city,
            address: room.hotel?.address,
            roomType: room.roomType,
            pricePerNight: room.pricePerNight,
            amenities: room.amenities,
        }));

        // Step 4: Ask the AI to rank and explain the top 3 matches
        const aiPrompt = `You are a hotel recommendation engine. A guest has these preferences:
- Destination city: ${city || "any"}
- Maximum budget per night: $${budget}
- Preferred amenities: ${amenities.length ? amenities.join(", ") : "no preference"}
- Guests: ${guests}
- Check-in: ${checkInDate || "flexible"}
- Check-out: ${checkOutDate || "flexible"}

Here are the available rooms (JSON):
${JSON.stringify(roomSummaries, null, 2)}

Return a JSON array of the top 3 recommended rooms (or fewer if less are available).
Each item must have:
  - "index": the room's index from the list above
  - "score": a match score out of 10 (integer)
  - "reason": one sentence explaining why this room suits the guest

Only return the JSON array, no other text.`;

        const aiResponse = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: aiPrompt }],
            max_tokens: 400,
            temperature: 0.3,
            response_format: { type: "json_object" },
        });

        // Step 5: Parse the AI response and attach the full room data
        let rankings = [];
        try {
            const parsed = JSON.parse(aiResponse.choices[0].message.content);
            // The AI might return { recommendations: [...] } or just [...]
            rankings = Array.isArray(parsed) ? parsed : (parsed.recommendations || parsed.rooms || []);
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

        res.json({ success: true, recommendations });
    } catch (error) {
        console.error("AI recommend error:", error.message);
        res.json({ success: false, message: "AI recommendation service unavailable" });
    }
};
