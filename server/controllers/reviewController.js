import Review from "../models/Review.js";
import User from "../models/User.js";

// GET /api/reviews/room/:roomId
export const getRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;

    const reviews = await Review.find({ room: roomId })
      .sort({ createdAt: -1 })
      .limit(50);

    const userIds = [...new Set(reviews.map((r) => r.user))];
    const users = await User.find({ _id: { $in: userIds } }).select("name image");
    const userMap = Object.fromEntries(users.map((u) => [u._id, u]));

    const enriched = reviews.map((review) => ({
      ...review.toObject(),
      userDetails: userMap[review.user] || { name: "Guest", image: "" },
    }));

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return res.json({
      success: true,
      reviews: enriched,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.error("getRoomReviews error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { room, hotel, rating, comment } = req.body;

    if (!room || !hotel || !rating || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room, hotel, rating, and comment are required",
      });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const review = await Review.findOneAndUpdate(
      { user: req.user._id, room },
      {
        user: req.user._id,
        hotel,
        room,
        rating: numericRating,
        comment: comment.trim(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (err) {
    console.error("createReview error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/reviews/:reviewId
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.user !== req.user._id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await review.deleteOne();

    return res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    console.error("deleteReview error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
