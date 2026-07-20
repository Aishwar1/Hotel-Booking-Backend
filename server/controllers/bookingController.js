import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import transporter from "../configs/nodemailer.js";

// ============================================================
// Helper - Check Room Availability
// ============================================================

const checkAvailability = async ({ room, checkInDate, checkOutDate }) => {
  const bookings = await Booking.find({
    room,
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
    });

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: req.user.email,
        subject: "QuickStay Booking Confirmation",
        html: `
          <h2>Booking Confirmed</h2>

          <p>Hello ${req.user.name}</p>

          <p>Your booking has been created successfully.</p>

          <hr>

          <p><b>Hotel :</b> ${roomData.hotel.name}</p>
          <p><b>Check In :</b> ${new Date(
            booking.checkInDate
          ).toDateString()}</p>
          <p><b>Check Out :</b> ${new Date(
            booking.checkOutDate
          ).toDateString()}</p>
          <p><b>Total :</b> $${booking.totalPrice}</p>

          <hr>

          <p>Thank you for booking with QuickStay.</p>
        `,
      });
    } catch (mailError) {
      console.log("Email Error:", mailError.message);
    }

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