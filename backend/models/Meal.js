import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // link to user later
  mealName: { type: String, required: true },
  ingredients: [{ type: String }],
  rating: { type: Number, min: 1, max: 5, required: true },
  notes: String,
  imageUrl: String,
}, { timestamps: true });

export default mongoose.model("Meal", mealSchema);
