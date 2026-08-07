import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";
import fs from "fs";
import hotelbedsClient from "../utils/hotelbedsClient.js";
import kosonClient from "../utils/kosonClient.js";

// ============================================================
// ROOM CONTROLLER
// ============================================================

const ALLOWED_ROOM_TYPES = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite", "Penthouse Suite", "Luxury Suite"];
const ALLOWED_AMENITIES  = ["Free WiFi", "Free Breakfast", "Room Service", "Mountain View", "Pool Access"];

// POST /api/rooms  — Create a room for the owner's hotel
export const createRoom = async (req, res) => {
    const uploadedPaths = [];
    try {
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) {
            return res.status(400).json({ success: false, message: "No hotel found. Register a hotel first." });
        }

        // ---- Input validation ----
        const { roomType, pricePerNight, amenities: amenitiesRaw } = req.body;

        if (!ALLOWED_ROOM_TYPES.includes(roomType)) {
            return res.status(400).json({ success: false, message: "Invalid room type" });
        }

        const price = Number(pricePerNight);
        if (!Number.isFinite(price) || price <= 0 || price > 100000) {
            return res.status(400).json({ success: false, message: "Invalid price per night" });
        }

        let amenities = [];
        try {
            amenities = JSON.parse(amenitiesRaw);
        } catch {
            return res.status(400).json({ success: false, message: "Invalid amenities format" });
        }

        // Whitelist each amenity
        amenities = amenities.filter((a) => ALLOWED_AMENITIES.includes(a));

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }

        // ---- Upload images to Cloudinary ----
        req.files.forEach((f) => uploadedPaths.push(f.path));

        const images = await Promise.all(
            req.files.map(async (file) => {
                const response = await cloudinary.uploader.upload(file.path, {
                    folder: "quickstay/rooms",
                    resource_type: "image",
                });
                return response.secure_url;
            })
        );

        // Clean up temp files after upload
        uploadedPaths.forEach((p) => { try { fs.unlinkSync(p); } catch {} });

        await Room.create({ hotel: hotel._id, roomType, pricePerNight: price, amenities, images });
        res.json({ success: true, message: "Room created successfully" });

    } catch (error) {
        // Clean up any temp files on error
        uploadedPaths.forEach((p) => { try { fs.unlinkSync(p); } catch {} });
        console.error("createRoom error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/rooms  — All available rooms (public)
export const getRooms = async (req, res) => {
    try {
        let rooms = await Room.find({ isAvailable: true })
            .populate({
                path: "hotel",
                populate: { path: "owner", select: "image" },
            })
            .sort({ createdAt: -1 });

        // Convert to lean array to allow pushing custom objects
        rooms = rooms.map(r => r.toObject());

        try {
            const hbData = await hotelbedsClient.getHotels();
            
            if (hbData && hbData.hotels) {
                const hbHotels = hbData.hotels; 
                const mappedRooms = hbHotels.map(h => {
                    // Extract exactly 4 images or fallback
                    let images = [];
                    if (h.images && h.images.length > 0) {
                        images = h.images.slice(0, 4).map(img => `http://photos.hotelbeds.com/giata/${img.path}`);
                    }
                    while (images.length < 4) {
                        images.push("https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60");
                    }

                    return {
                        _id: `hb_${h.code}`,
                        hotel: {
                            name: h.name?.content || "Hotelbeds Hotel",
                            location: h.destination?.name?.content || "Global Destination",
                            description: h.description?.content || "A wonderful stay provided by Hotelbeds.",
                            address: h.address?.content || "City Center",
                            city: h.city?.content || h.destination?.name?.content || "Global Destination",
                            latitude: h.coordinates?.latitude || 0,
                            longitude: h.coordinates?.longitude || 0,
                            owner: { image: "" }
                        },
                        roomType: "Standard Room",
                        pricePerNight: 150, 
                        amenities: ["Free WiFi", "Room Service", "Air Conditioning"],
                        images: images,
                        isAvailable: true,
                        isHotelbeds: true 
                    };
                });
                rooms = [...rooms, ...mappedRooms];
            }
        } catch (hbError) {
            console.error("Failed to fetch from Hotelbeds:", hbError.message);
        }

        try {
            const ksData = await kosonClient.getHotels();
            if (Array.isArray(ksData)) {
                // Limit to 100 to prevent performance issues
                const ksHotels = ksData.slice(0, 100);
                
                const mappedKsRooms = ksHotels.map(h => {
                    const hotelName = encodeURIComponent(h["Hotel Name"] || "Indian Hotel");
                    const index = h["S.No."] || Math.floor(Math.random() * 1000);
                    
                    const dynamicImages = [
                        `https://loremflickr.com/800/600/hotel,india,room?lock=${index * 4 + 1}`,
                        `https://loremflickr.com/800/600/hotel,india,bedroom?lock=${index * 4 + 2}`,
                        `https://loremflickr.com/800/600/hotel,india,resort?lock=${index * 4 + 3}`,
                        `https://loremflickr.com/800/600/hotel,india,building?lock=${index * 4 + 4}`
                    ];

                    return {
                        _id: `ks_${h["S.No."]}`,
                        hotel: {
                            name: h["Hotel Name"] || "Indian Hotel",
                            location: h["City"] || "India",
                            description: `A beautiful ${h["Category"] || "hotel"} located in ${h["City"]}, ${h["State"]}.`,
                            address: h["Address"] || h["City"],
                            city: h["City"],
                            latitude: 0,
                            longitude: 0,
                            owner: { image: "" }
                        },
                        roomType: h["Category"] === "5 Star" ? "Luxury Suite" : "Standard Room",
                        pricePerNight: h["Category"] === "5 Star" ? 500 : 100,
                        amenities: ["Free WiFi", "Room Service", "Air Conditioning"],
                        images: dynamicImages,
                        isAvailable: true,
                        isKoson: true 
                    };
                });
                rooms = [...rooms, ...mappedKsRooms];
            }
        } catch (ksError) {
            console.error("Failed to fetch from Koson API:", ksError.message);
        }

        // Shuffle the array so it's not always in the same default order
        for (let i = rooms.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rooms[i], rooms[j]] = [rooms[j], rooms[i]];
        }

        res.json({ success: true, rooms });
    } catch (error) {
        console.error("getRooms error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/rooms/owner  — Owner's rooms only
export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({ owner: req.user._id });
        if (!hotelData) {
            return res.json({ success: true, rooms: [] });
        }

        const rooms = await Room.find({ hotel: hotelData._id }).populate("hotel");
        res.json({ success: true, rooms });
    } catch (error) {
        console.error("getOwnerRooms error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/rooms/toggle-availability
export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;

        // Validate roomId format to prevent injection
        if (!roomId || typeof roomId !== "string" || !/^[a-f\d]{24}$/i.test(roomId)) {
            return res.status(400).json({ success: false, message: "Invalid room ID" });
        }

        // Verify this room belongs to the owner's hotel
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) {
            return res.status(403).json({ success: false, message: "No hotel found for this account" });
        }

        const room = await Room.findOne({ _id: roomId, hotel: hotel._id });
        if (!room) {
            return res.status(403).json({ success: false, message: "Room not found or access denied" });
        }

        room.isAvailable = !room.isAvailable;
        await room.save();

        res.json({ success: true, message: "Room availability updated" });
    } catch (error) {
        console.error("toggleRoomAvailability error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
