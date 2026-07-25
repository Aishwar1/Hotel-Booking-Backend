import Room from "../models/Room.js";

export const buildRoomCatalog = async () => {
  const rooms = await Room.find({ isAvailable: true }).populate("hotel");

  return rooms.map((room, index) => ({
    index,
    roomId: room._id.toString(),
    hotelName: room.hotel?.name || "Unknown",
    city: room.hotel?.city || "Unknown",
    address: room.hotel?.address || "",
    roomType: room.roomType,
    pricePerNight: room.pricePerNight,
    amenities: room.amenities,
    latitude: room.hotel?.latitude,
    longitude: room.hotel?.longitude,
  }));
};

export const parseAIJson = (text) => {
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};
