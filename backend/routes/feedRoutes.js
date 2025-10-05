import express from "express";
import User from "../models/User.js";
import Meal from "../models/Meal.js";

const router = express.Router();

// ✅ Get feed for a user (their meals + friends' meals)
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("friends");

    if (!user) return res.status(404).json({ error: "User not found" });

    // Get all IDs: user + friends
    const allIds = [user._id, ...user.friends.map(f => f._id)];

    // Find meals for all those users
    const meals = await Meal.find({ userId: { $in: allIds } })
      .populate("userId", "username displayName")
      .sort({ createdAt: -1 });

    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
