import Stripe from "stripe";
import Booking from "../models/Booking.js";

// ============================================================
// PAYMENT CONTROLLER  (NEW — Stripe Integration)
// ============================================================
// Two endpoints:
//
//  POST /api/payments/create-checkout-session
//    - Verifies the booking belongs to the authenticated user
//    - Creates a Stripe Checkout session with the booking's
//      amount and stores bookingId + userId in session metadata
//    - Returns the Stripe-hosted checkout URL
//
//  POST /api/payments/verify
//    - Called by the client after Stripe redirects back
//    - Retrieves the session from Stripe (authoritative source)
//    - Validates: session is paid, metadata.bookingId matches
//      the supplied bookingId, and the booking belongs to the
//      authenticated user — prevents cross-booking tampering
//    - Only then marks the booking as paid
//
// Stripe client is lazy-initialised so the server starts cleanly
// even before STRIPE_SECRET_KEY is configured.
// ============================================================

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not set. Add it to Replit Secrets.");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// ---- POST /api/payments/create-checkout-session ----
export const createCheckoutSession = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.auth.userId;

        // Load booking with room and hotel details
        const booking = await Booking.findById(bookingId).populate("room hotel");
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // ---- Ownership check ----
        // booking.user is the Clerk userId string stored at creation time
        if (booking.user !== userId) {
            return res.status(403).json({ success: false, message: "You do not own this booking" });
        }

        if (booking.isPaid) {
            return res.json({ success: false, message: "This booking is already paid" });
        }

        // Build the Stripe Checkout session.
        // We store both bookingId and userId in metadata so the
        // verify endpoint can cross-check without trusting the client.
        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: Math.round(booking.totalPrice * 100), // Stripe uses cents
                        product_data: {
                            name: `${booking.hotel.name} – ${booking.room.roomType}`,
                            description: `Check-in: ${new Date(booking.checkInDate).toDateString()} | Check-out: ${new Date(booking.checkOutDate).toDateString()}`,
                        },
                    },
                    quantity: 1,
                },
            ],
            // After payment Stripe redirects here.
            // {CHECKOUT_SESSION_ID} is a Stripe template variable — it is filled
            // in by Stripe, not by us.
            success_url: `${process.env.CLIENT_URL}/payment-success?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${process.env.CLIENT_URL}/my-bookings`,
            metadata: {
                bookingId: bookingId.toString(),
                userId,          // stored so verify can check ownership server-side
            },
        });

        res.json({ success: true, url: session.url });
    } catch (error) {
        console.error("createCheckoutSession error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---- POST /api/payments/verify ----
export const verifyPayment = async (req, res) => {
    try {
        const { sessionId, bookingId } = req.body;
        const userId = req.auth.userId;

        // Retrieve the session from Stripe — this is the authoritative record
        const session = await getStripe().checkout.sessions.retrieve(sessionId);

        // 1. Confirm Stripe actually received payment
        if (session.payment_status !== "paid") {
            return res.json({ success: false, message: "Payment not completed" });
        }

        // 2. Confirm the session was created for this exact booking
        //    (prevents a user supplying a valid session from a different booking)
        if (session.metadata?.bookingId !== bookingId.toString()) {
            return res.status(403).json({ success: false, message: "Session does not match this booking" });
        }

        // 3. Confirm the session was created by the authenticated user
        if (session.metadata?.userId !== userId) {
            return res.status(403).json({ success: false, message: "You do not own this payment session" });
        }

        // 4. Confirm the booking belongs to this user in our database
        const booking = await Booking.findById(bookingId);
        if (!booking || booking.user !== userId) {
            return res.status(403).json({ success: false, message: "Booking ownership mismatch" });
        }

        // All checks passed — mark as paid
        await Booking.findByIdAndUpdate(bookingId, {
            isPaid: true,
            paymentMethod: "Stripe",
        });

        res.json({ success: true, message: "Payment verified and booking confirmed" });
    } catch (error) {
        console.error("verifyPayment error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
