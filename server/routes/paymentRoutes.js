import express from "express";
import { createCheckoutSession, verifyPayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

// ============================================================
// PAYMENT ROUTES  (NEW)
// ============================================================
// POST /api/payments/create-checkout-session  → kick off Stripe Checkout
// POST /api/payments/verify                   → confirm payment after redirect
// ============================================================

const paymentRouter = express.Router();

paymentRouter.post("/create-checkout-session", protect, createCheckoutSession);
paymentRouter.post("/verify", protect, verifyPayment);

export default paymentRouter;
