import { useState } from "react";
import { addMeal } from "../api";

export default function AddMeal({ userId }) {
  const [mealName, setMealName] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("mealName", mealName);
    formData.append("rating", rating);
    if (image) formData.append("image", image);

    const res = await addMeal(formData);
    setMessage(res.message);
  }

  return (
    <form onSubmit={handleSubmit} className="add-meal-form">
      <h2>Add New Meal</h2>
      <input placeholder="Meal Name" value={mealName} onChange={(e) => setMealName(e.target.value)} required />
      <input placeholder="Rating (1–5)" type="number" value={rating} onChange={(e) => setRating(e.target.value)} required />
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button type="submit">Upload</button>
      {message && <p>{message}</p>}
    </form>
  );
}
