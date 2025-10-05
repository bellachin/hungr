import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  quantity: { type: Number, default: 0 },
  price: Number,
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);
