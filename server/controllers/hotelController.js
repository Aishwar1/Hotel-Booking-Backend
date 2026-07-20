import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

// ── POST /api/hotels ─────────────────────────────────────────────────────────
// Register a hotel for the authenticated user (one per owner).
export const registerHotel = async (req, res) => {
    try {
        const { name, address, contact, city } = req.body;
        const owner = req.auth.userId;

        // ── Input validation ──────────────────────────────────────────────────
        if (!name?.trim() || !address?.trim() || !contact?.trim() || !city?.trim()) {
            return res.status(400).json({
                success: false,
                message: "name, address, contact, and city are all required",
            });
        }

        if (name.length > 100 || address.length > 200 || city.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Input fields exceed maximum allowed length",
            });
        }

        // Basic phone / contact sanity check — allows digits, spaces, +, -, ()
        if (!/^[0-9\s\+\-\(\)]{6,20}$/.test(contact.trim())) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact number format",
            });
        }

        // ── One hotel per owner ───────────────────────────────────────────────
        const existing = await Hotel.findOne({ owner });
        if (existing) {
            return res.json({ success: false, message: "You have already registered a hotel" });
        }

        await Hotel.create({
            name:    name.trim(),
            address: address.trim(),
            contact: contact.trim(),
            city:    city.trim(),
            owner,
        });

        await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

        res.json({ success: true, message: "Hotel registered successfully" });
    } catch (error) {
        console.error("registerHotel error:", error.message);
        res.status(500).json({ success: false, message: "Failed to register hotel" });
    }
};
