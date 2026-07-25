import express from "express";
import {
  createReview,
  deleteReview,
  getRoomReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.get("/room/:roomId", getRoomReviews);
reviewRouter.post("/", protect, createReview);
reviewRouter.delete("/:reviewId", protect, deleteReview);

export default reviewRouter;
