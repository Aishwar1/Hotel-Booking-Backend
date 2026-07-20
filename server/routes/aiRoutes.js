import express from "express";
import { chatWithAI, getAIRecommendations } from "../controllers/aiController.js";

// ============================================================
// AI ROUTES  (NEW)
// ============================================================
// POST /api/ai/chat       → Chatbot conversation
// POST /api/ai/recommend  → Hotel recommendation engine
//
// These routes are public (no auth required) so guests can
// use the chatbot and recommendations before signing in.
// ============================================================

const aiRouter = express.Router();

aiRouter.post("/chat", chatWithAI);
aiRouter.post("/recommend", getAIRecommendations);

export default aiRouter;
