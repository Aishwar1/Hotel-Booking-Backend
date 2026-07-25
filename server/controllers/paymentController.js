import Stripe from "stripe";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendPaymentConfirmationEmail } from "../utils/email.js";

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

    // -------------------------------
    // CLIENT URL
    // -------------------------------

    const clientUrl = process.env.CLIENT_URL?.trim();

    console.log("CLIENT_URL =", clientUrl);

    if (!clientUrl) {
      throw new Error("CLIENT_URL environment variable is missing");
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

      success_url: `${clientUrl}/payment-success?bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${clientUrl}/my-bookings`,

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

    const booking = await Booking.findById(bookingId)
      .populate("room")
      .populate("hotel");

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

    const wasPaid = booking.isPaid;
    booking.isPaid = true;
    booking.paymentMethod = "Stripe";
    booking.status = "confirmed";

    await booking.save();

    let emailSent = Boolean(booking.paymentEmailSentAt);
    let emailMessage = "Confirmation email already sent.";
    if (!emailSent) {
      const user = await User.findById(userId);
      const recipient = user?.email || session.customer_details?.email;
      if (recipient) {
        try {
          await sendPaymentConfirmationEmail({
            to: recipient,
            name: user?.name || session.customer_details?.name || "Traveller",
            hotelName: booking.hotel?.name || "Hotel",
            roomType: booking.room?.roomType || "Room",
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            totalPrice: booking.totalPrice,
          });
          booking.paymentEmailSentAt = new Date();
          await booking.save();
          emailSent = true;
          emailMessage = "Confirmation email sent.";
        } catch (emailError) {
          console.error("Payment confirmation email failed:", emailError.message);
          emailMessage = "Payment is confirmed, but the confirmation email could not be sent.";
        }
      } else {
        emailMessage = "Payment is confirmed, but no recipient email was available.";
      }
    }

    return res.json({
      success: true,
      message: wasPaid ? "Payment was already verified." : "Payment verified successfully",
      emailSent,
      emailMessage,
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
