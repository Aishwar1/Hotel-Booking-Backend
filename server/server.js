import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { clerkMiddleware } from "@clerk/express";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Bootstrap ────────────────────────────────────────────────────────────────
connectDB();
connectCloudinary();

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
// contentSecurityPolicy is disabled so Vite-injected scripts don't get blocked
// in the preview pane; re-enable and configure properly for production hardening.
app.use(
    helmet({
        contentSecurityPolicy:    false,
        crossOriginEmbedderPolicy: false,
    })
);

// ── CORS ─────────────────────────────────────────────────────────────────────
// Accept all origins in dev; in production behind a CDN the CDN handles this.
app.use(cors({ origin: (_, cb) => cb(null, true), credentials: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// General: 200 requests per 15 min per IP.
// AI endpoints: 20 requests per 15 min (expensive OpenAI calls).
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const aiLimiter      = rateLimit({ windowMs: 15 * 60 * 1000, max: 20,
    message: { success: false, message: "Too many AI requests – please wait and try again." },
});
app.use("/api",    generalLimiter);
app.use("/api/ai", aiLimiter);

// ── Clerk Webhook (must come BEFORE express.json) ────────────────────────────
// Svix signature verification requires the original raw request bytes.
// express.json() re-serialises the body and breaks the HMAC — keep raw here.
app.use("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());

// ── NoSQL injection protection ────────────────────────────────────────────────
// Strips keys that start with '$' or contain '.' from req.body / query / params.
app.use(mongoSanitize());

// ── Clerk auth middleware ─────────────────────────────────────────────────────
app.use(clerkMiddleware());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/user",     userRouter);    // User profile & recent searches
app.use("/api/hotels",   hotelRouter);   // Hotel registration
app.use("/api/rooms",    roomRouter);    // Room CRUD + availability toggle
app.use("/api/bookings", bookingRouter); // Booking creation & retrieval
app.use("/api/payments", paymentRouter); // Stripe checkout & verification
app.use("/api/ai",       aiRouter);      // AI chatbot & recommendations

// ── Production: serve the Vite build ─────────────────────────────────────────
// In development, the Vite dev server (port 5000) proxies /api/* to this
// Express server (port 3000) — no static serving needed.
// In production (Render), Express serves everything from one process.
if (process.env.NODE_ENV === "production") {
    const clientDist = path.join(__dirname, "../client/dist");
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
} else {
    app.get("/", (_req, res) => res.send("QuickStay API — development mode"));
}

// ── Global error handler ──────────────────────────────────────────────────────
// Catches any error passed to next(err) from route handlers.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`QuickStay server running on port ${PORT}`));
