import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import {
  sendBookingCreatedEmail,
  sendBookingCancelledEmail,
} from "../utils/email.js";

// ============================================================
// Helper - Check Room Availability
// ============================================================

const checkAvailability = async ({ room, checkInDate, checkOutDate }) => {
  const bookings = await Booking.find({
    room,
    status: { $ne: "cancelled" },
    checkInDate: { $lt: new Date(checkOutDate) },
    checkOutDate: { $gt: new Date(checkInDate) },
  });

  return bookings.length === 0;
};

// ============================================================
// POST /api/bookings/check-availability
// ============================================================

export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;

    if (!room || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Missing booking information",
      });
    }

    const available = await checkAvailability({
      room,
      checkInDate,
      checkOutDate,
    });

    return res.json({
      success: true,
      isAvailable: available,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// POST /api/bookings/book
// ============================================================

export const createBooking = async (req, res) => {
  try {
    console.log("========= CREATE BOOKING =========");
    console.log("req.user :", req.user);

    const {
      room,
      checkInDate,
      checkOutDate,
      guests,
      paymentMethod = "Pay At Hotel",
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    const roomData = await Room.findById(room).populate("hotel");

    if (!roomData) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const available = await checkAvailability({
      room,
      checkInDate,
      checkOutDate,
    });

    if (!available) {
      return res.json({
        success: false,
        message: "Room not available",
      });
    }

    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) /
        (1000 * 60 * 60 * 24)
    );

    const booking = await Booking.create({
      user: req.user._id,
      room: roomData._id,
      hotel: roomData.hotel._id,
      guests: Number(guests),
      checkInDate,
      checkOutDate,
      totalPrice: roomData.pricePerNight * nights,
      paymentMethod,
      isPaid: false,
      status: paymentMethod === "Pay At Hotel" ? "confirmed" : "pending",
    });

    // Send email for Pay At Hotel bookings (Stripe sends after payment)
    if (paymentMethod === "Pay At Hotel") {
      sendBookingCreatedEmail({
        to: req.user.email,
        name: req.user.name,
        hotelName: roomData.hotel.name,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalPrice: booking.totalPrice,
        paymentMethod,
      })
        .then(() => console.log("Booking email sent"))
        .catch((err) => console.log("Email Error:", err.message));
    }

    // IMPORTANT:
    // Return immediately without waiting for email
    return res.json({
      success: true,
      bookingId: booking._id,
      message: "Booking created successfully",
    });
  } catch (err) {
    console.log("============== BOOKING ERROR ==============");
    console.log(err);
    console.log("===========================================");

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// GET USER BOOKINGS
// ============================================================

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("room")
      .populate("hotel")
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// GET HOTEL BOOKINGS
// ============================================================

export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      owner: req.user._id,
    });

    if (!hotel) {
      return res.json({
        success: false,
        message: "No hotel found.",
      });
    }

    const bookings = await Booking.find({
      hotel: hotel._id,
    })
      .populate("room")
      .populate("hotel")
      .populate("user")
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      dashboardData: {
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce(
          (sum, booking) => sum + booking.totalPrice,
          0
        ),
        bookings,
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// POST /api/bookings/cancel
// ============================================================

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("hotel")
      .populate("room");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own bookings",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(booking.checkInDate) < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a booking that has already started",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    sendBookingCancelledEmail({
      to: req.user.email,
      name: req.user.name,
      hotelName: booking.hotel?.name || "Hotel",
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
    })
      .then(() => console.log("Cancellation email sent"))
      .catch((err) => console.log("Email Error:", err.message));

    return res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (err) {
    console.error("cancelBooking error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// GET /api/bookings/room/:roomId/dates
// ============================================================

export const getRoomBookedDates = async (req, res) => {
  try {
    const { roomId } = req.params;

    const bookings = await Booking.find({
      room: roomId,
      status: { $ne: "cancelled" },
      checkOutDate: { $gte: new Date() },
    }).select("checkInDate checkOutDate status");

    return res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    console.error("getRoomBookedDates error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};