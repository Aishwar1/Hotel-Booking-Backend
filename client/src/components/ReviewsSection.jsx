import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import StarRating from "./StarRating";
import InteractiveStarRating from "./InteractiveStarRating";

const ReviewsSection = ({ roomId, hotelId }) => {
  const { axios, getToken, user } = useAppContext();

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/room/${roomId}`);
      if (data.success) {
        setReviews(data.reviews);
        setAvgRating(data.avgRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) fetchReviews();
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      return toast.error("Please sign in to leave a review");
    }

    if (!comment.trim()) {
      return toast.error("Please write a comment");
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        "/api/reviews",
        { room: roomId, hotel: hotelId, rating, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setComment("");
        setRating(5);
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;

    try {
      const { data } = await axios.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        toast.success("Review deleted");
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mt-16 max-w-4xl">
      <h2 className="text-2xl md:text-3xl font-playfair mb-2">Guest Reviews</h2>
      <div className="flex items-center gap-2 mb-8">
        <StarRating rating={Math.round(avgRating) || 4} />
        <span className="text-gray-600">
          {totalReviews > 0
            ? `${avgRating} · ${totalReviews} review${totalReviews !== 1 ? "s" : ""}`
            : "No reviews yet — be the first!"}
        </span>
      </div>

      {user && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-xl p-6 mb-10 border border-gray-100"
        >
          <p className="font-medium text-gray-800 mb-3">Write a Review</p>
          <InteractiveStarRating rating={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience at this hotel..."
            rows={4}
            maxLength={1000}
            className="w-full mt-4 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 resize-none"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {!user && (
        <p className="text-gray-500 mb-8 bg-gray-50 rounded-lg p-4">
          Sign in to share your experience with other guests.
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews for this room yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border-b border-gray-200 pb-6 last:border-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={review.userDetails?.image || ""}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                  />
                  <div>
                    <p className="font-medium">{review.userDetails?.name || "Guest"}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-3 text-gray-700">{review.comment}</p>
              {user?.id === review.user && (
                <button
                  onClick={() => handleDelete(review._id)}
                  className="text-sm text-red-500 mt-2 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
