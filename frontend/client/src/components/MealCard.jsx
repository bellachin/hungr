import { useState } from "react";
import { likeMeal, commentMeal } from "../api";

export default function MealCard({ meal, userId }) {
  const [likes, setLikes] = useState(meal.likes?.length || 0);
  const [commentText, setCommentText] = useState("");

  async function handleLike() {
    const res = await likeMeal(meal._id, userId);
    setLikes(res.likes);
  }

  async function handleComment() {
    if (!commentText.trim()) return;
    await commentMeal(meal._id, userId, commentText);
    setCommentText("");
  }

  return (
    <div className="meal-card">
      {meal.imageUrl && <img src={meal.imageUrl} alt={meal.mealName} className="meal-image" />}
      <h3>{meal.mealName}</h3>
      <p>Rating: {meal.rating}</p>
      <p>By: {meal.userId?.displayName || "Anonymous"}</p>

      <button onClick={handleLike}>❤️ {likes}</button>

      <div className="comment-section">
        <input
          type="text"
          placeholder="Add comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button onClick={handleComment}>💬</button>
      </div>
    </div>
  );
}
