import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mealName: { type: String, required: true },
  ingredients: { type: [String], default: [] },
  rating: { type: Number, required: true }, // user’s raw rating
  notes: String,
  rankScore: { type: Number, default: 0 }, // derived score
}, { timestamps: true });

export default mongoose.model("Meal", mealSchema);
