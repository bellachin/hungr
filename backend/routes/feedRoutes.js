import express from "express";
import User from "../models/User.js";
import Meal from "../models/Meal.js";

const router = express.Router();

// feed: user + friends' meals
router.get("/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId).populate("friends");
  if (!user) return res.status(404).json({ error: "User not found" });

  const ids = [user._id, ...user.friends.map(f => f._id)];
  const meals = await Meal.find({ userId: { $in: ids } })
    .populate("userId", "username displayName")
    .sort({ createdAt: -1 });

  res.json(meals);
});

export default router;
