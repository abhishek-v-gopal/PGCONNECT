"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createReview } from "../../api";

const STAR_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function ReviewForm({ propertyId }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!rating) {
      setFeedback({ type: "error", text: "Please select a star rating." });
      return;
    }

    try {
      setSubmitting(true);
      const response = await createReview({ property_id: propertyId, rating, comment: comment.trim() });
      if (response?.success) {
        setFeedback({ type: "success", text: "Thanks! Your review is pending moderation and will appear once approved." });
        setRating(0);
        setComment("");
      } else {
        setFeedback({ type: "error", text: "Unable to submit review right now." });
      }
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        router.push("/signin");
        return;
      }
      if (error?.status === 409) {
        setFeedback({ type: "error", text: "You've already reviewed this property." });
      } else {
        setFeedback({ type: "error", text: error?.message || "Failed to submit review. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Write a Review</h2>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              type="button"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="cursor-pointer text-2xl leading-none"
              style={{ color: star <= displayRating ? "#F97316" : "#e2e8f0" }}
              aria-label={`${star} star`}
            >
              ★
            </motion.button>
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-xs font-semibold text-slate-500">{STAR_LABELS[displayRating - 1]}</span>
          )}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience living here (optional)"
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
        />

        <AnimatePresence>
          {feedback && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`text-xs overflow-hidden ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {feedback.text}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: submitting ? 1 : 1.02 }}
          whileTap={{ scale: submitting ? 1 : 0.97 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm hover:shadow-md"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </motion.button>
      </form>
    </div>
  );
}
