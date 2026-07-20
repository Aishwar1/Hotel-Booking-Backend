import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import transporter from "../configs/nodemailer.js";

// ============================================================
// BOOKING CONTROLLER
// ============================================================

// ---------- Helper: check if a room is free for given dates ----------
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate:  { $lte: new Date(checkOutDate) },
            checkOutDate: { $gte: new Date(checkInDate) },
        });
        return bookings.length === 0;
    } catch (error) {
        console.error("checkAvailability error:", error.message);
        return false;
    }
};

// ---------- POST /api/bookings/check-availability ----------
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;

        if (!room || !checkInDate || !checkOutDate) {
            return res.status(400).json({ success: false, message: "room, checkInDate, and checkOutDate are required" });
        }

        // Validate date ordering
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            return res.status(400).json({ success: false, message: "checkOutDate must be after checkInDate" });
        }

        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({ success: true, isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------- POST /api/bookings/book ----------
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests, paymentMethod = "Pay At Hotel" } = req.body;
        const user = req.auth.userId;

        // ---- Input validation ----
        if (!room || !checkInDate || !checkOutDate) {
            return res.status(400).json({ success: false, message: "room, checkInDate, and checkOutDate are required" });
        }
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            return res.status(400).json({ success: false, message: "checkOutDate must be after checkInDate" });
        }
        const guestCount = Number(guests);
        if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 20) {
            return res.status(400).json({ success: false, message: "Invalid guest count" });
        }
        const ALLOWED_PAYMENT_METHODS = ["Pay At Hotel", "Stripe"];
        if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: "Invalid payment method" });
        }

        // Double-check availability before confirming
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        if (!isAvailable) {
            return res.json({ success: false, message: "Room is not available for these dates" });
        }

        const roomData = await Room.findById(room).populate("hotel");
        if (!roomData) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        const nights = Math.ceil(
            (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 3600 * 24)
        );
        const totalPrice = roomData.pricePerNight * nights;

        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: guestCount,
            checkInDate,
            checkOutDate,
            totalPrice,
            paymentMethod,
            isPaid: false,
        });

        // ---- Send confirmation email (failure does NOT block booking) ----
        try {
            await transporter.sendMail({
                from: process.env.SENDER_EMAIL,
                to: req.user.email,
                subject: "QuickStay – Booking Confirmation",
                html: `
                    <h2>Your Booking is Confirmed! 🏨</h2>
                    <p>Dear ${req.user.name},</p>
                    <p>Thank you for booking with QuickStay. Here are your details:</p>
                    <ul>
                        <li><strong>Booking ID:</strong> ${booking._id}</li>
                        <li><strong>Hotel:</strong> ${roomData.hotel.name}</li>
                        <li><strong>Location:</strong> ${roomData.hotel.address}</li>
                        <li><strong>Check-In:</strong> ${new Date(booking.checkInDate).toDateString()}</li>
                        <li><strong>Check-Out:</strong> ${new Date(booking.checkOutDate).toDateString()}</li>
                        <li><strong>Nights:</strong> ${nights}</li>
                        <li><strong>Total:</strong> $${booking.totalPrice}</li>
                        <li><strong>Payment:</strong> ${paymentMethod}</li>
                    </ul>
                    <p>We look forward to welcoming you!</p>
                `,
            });
        } catch (mailError) {
            console.error("Booking email failed (non-fatal):", mailError.message);
        }

        res.json({ success: true, message: "Booking created successfully", bookingId: booking._id });
    } catch (error) {
        console.error("createBooking error:", error.message);
        res.status(500).json({ success: false, message: "Failed to create booking" });
    }
};

// ---------- GET /api/bookings/user ----------
export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("room hotel")
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.error("getUserBookings error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
};

// ---------- GET /api/bookings/hotel (owner dashboard) ----------
export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if (!hotel) {
            return res.json({ success: false, message: "No hotel found for this account" });
        }

        const bookings = await Booking.find({ hotel: hotel._id })
            .populate("room hotel user")
            .sort({ createdAt: -1 });

        const totalBookings = bookings.length;
        const totalRevenue  = bookings.reduce((acc, b) => acc + b.totalPrice, 0);

        res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });
    } catch (error) {
        console.error("getHotelBookings error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
};
