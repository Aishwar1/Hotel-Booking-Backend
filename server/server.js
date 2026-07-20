import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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

// Connect Database
connectDB();
connectCloudinary();

const app = express();

// ---------------- Security ----------------

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ---------------- CORS ----------------

app.use(
  cors({
    origin: (_, callback) => callback(null, true),
    credentials: true,
  })
);

// ---------------- Rate Limiter ----------------

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many AI requests. Please try again later.",
  },
});

app.use("/api", generalLimiter);
app.use("/api/ai", aiLimiter);

// ---------------- Clerk Webhook ----------------

app.use(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// ---------------- Middleware ----------------

app.use(express.json());

// express-mongo-sanitize is NOT compatible with Express 5
// app.use(mongoSanitize());

app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

// ---------------- Health ----------------

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "Server Running",
    timestamp: new Date().toISOString(),
  });
});

// ---------------- API Routes ----------------

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/ai", aiRouter);

// ---------------- Production ----------------

if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../client/dist");

  app.use(express.static(clientDist));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("🚀 QuickStay API Running");
  });
}

// ---------------- API 404 ----------------

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// ---------------- Error Handler ----------------

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ---------------- Start ----------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 QuickStay Server running on port ${PORT}`);
});