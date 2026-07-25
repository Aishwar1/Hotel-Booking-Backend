import express from "express";
import {
  chatWithAI,
  getAIRecommendations,
  smartSearch,
  tripPlanner,
  vibeSurprise,
  getFeaturedHotels,
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/chat", chatWithAI);
aiRouter.post("/recommend", getAIRecommendations);
aiRouter.post("/smart-search", smartSearch);
aiRouter.post("/trip-planner", tripPlanner);
aiRouter.post("/vibe-surprise", vibeSurprise);
aiRouter.get("/featured", getFeaturedHotels);

export default aiRouter;
