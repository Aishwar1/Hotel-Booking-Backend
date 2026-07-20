import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";
import fs from "fs";

// ============================================================
// ROOM CONTROLLER
// ============================================================

const ALLOWED_ROOM_TYPES = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite", "Penthouse Suite", "Luxury Suite"];
const ALLOWED_AMENITIES  = ["Free WiFi", "Free Breakfast", "Room Service", "Mountain View", "Pool Access"];

// POST /api/rooms  — Create a room for the owner's hotel
export const createRoom = async (req, res) => {
    const uploadedPaths = [];
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
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
        const rooms = await Room.find({ isAvailable: true })
            .populate({
                path: "hotel",
                populate: { path: "owner", select: "image" },
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, rooms });
    } catch (error) {
        console.error("getRooms error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/rooms/owner  — Owner's rooms only
export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({ owner: req.auth.userId });
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
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
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
