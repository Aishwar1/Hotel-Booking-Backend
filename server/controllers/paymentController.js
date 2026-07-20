import Stripe from "stripe";
import Booking from "../models/Booking.js";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// ============================================================
// CREATE STRIPE CHECKOUT SESSION
// ============================================================

export const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const userId = req.user._id;

    console.log("========== CREATE CHECKOUT ==========");
    console.log("User:", userId);
    console.log("Booking:", bookingId);

    const booking = await Booking.findById(bookingId)
      .populate("room")
      .populate("hotel");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log("Booking Owner:", booking.user);

    if (booking.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not own this booking",
      });
    }

    if (booking.isPaid) {
      return res.json({
        success: false,
        message: "Booking already paid",
      });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "usd",

            unit_amount: Math.round(booking.totalPrice * 100),

            product_data: {
              name: `${booking.hotel.name} - ${booking.room.roomType}`,

              description: `Check In : ${new Date(
                booking.checkInDate
              ).toDateString()}
Check Out : ${new Date(
                booking.checkOutDate
              ).toDateString()}`,
            },
          },
        },
      ],

      success_url: `${process.env.CLIENT_URL}/payment-success?bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.CLIENT_URL}/my-bookings`,

      metadata: {
        bookingId: booking._id.toString(),
        userId,
      },
    });

    return res.json({
      success: true,
      url: session.url,
    });
  } catch (err) {
    console.log("========== PAYMENT ERROR ==========");
    console.log(err);
    console.log("===================================");

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// VERIFY PAYMENT
// ============================================================

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId, bookingId } = req.body;

    const userId = req.user._id;

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.json({
        success: false,
        message: "Payment not completed",
      });
    }

    if (session.metadata.bookingId !== bookingId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Booking mismatch",
      });
    }

    if (session.metadata.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Payment belongs to another user",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "Booking ownership mismatch",
      });
    }

    booking.isPaid = true;
    booking.paymentMethod = "Stripe";

    await booking.save();

    return res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (err) {
    console.log("========== VERIFY ERROR ==========");
    console.log(err);
    console.log("==================================");

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};