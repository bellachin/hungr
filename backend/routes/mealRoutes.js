import express from "express";
import Meal from "../models/Meal.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

// 🧠 helper: re-rank meals for one user (bubble sort logic)
async function rankUserMeals(userId) {
  const meals = await Meal.find({ userId });
  if (meals.length < 5) return; // only rank if 5+

  // bubble sort by rating
  for (let i = 0; i < meals.length - 1; i++) {
    for (let j = 0; j < meals.length - i - 1; j++) {
      if (meals[j].rating < meals[j + 1].rating) {
        [meals[j], meals[j + 1]] = [meals[j + 1], meals[j]];
      }
    }
  }

  // assign rankScore
  meals.forEach((meal, index) => {
    meal.rankScore = meals.length - index;
  });

  // save all
  for (const meal of meals) await meal.save();
}

// ✅ GET: all meals (optional global view)
router.get("/", async (req, res) => {
  try {
    const meals = await Meal.find().sort({ createdAt: -1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET: meals for one user, sorted by rank
router.get("/user/:userId", async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.params.userId })
      .populate("userId", "username displayName")
      .sort({ rankScore: -1, createdAt: -1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST: create meal (with optional image upload)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { userId, mealName, rating, ingredients, notes } = req.body;

    if (!userId || !mealName || !rating) {
      return res.status(400).json({ error: "userId, mealName, and rating are required." });
    }

    const imageUrl = req.file ? req.file.path : null;

    const newMeal = new Meal({
      userId,
      mealName,
      rating,
      ingredients,
      notes,
      imageUrl,
    });

    await newMeal.save();
    await rankUserMeals(userId);

    res.json({
      message: "Meal added and ranked (if 5+ meals).",
      imageUrl,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ POST: like or unlike a meal
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ error: "Meal not found" });

    const index = meal.likes.indexOf(userId);

    if (index === -1) {
      meal.likes.push(userId); // like
    } else {
      meal.likes.splice(index, 1); // unlike
    }

    await meal.save();
    res.json({ likes: meal.likes.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ POST: add comment
router.post("/:id/comment", async (req, res) => {
  try {
    const { userId, text } = req.body;
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ error: "Meal not found" });

    meal.comments.push({ userId, text });
    await meal.save();

    res.json({ comments: meal.comments });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ DELETE: remove meal (and rerank)
router.delete("/:id", async (req, res) => {
  try {
    const deletedMeal = await Meal.findByIdAndDelete(req.params.id);
    if (!deletedMeal) return res.status(404).json({ error: "Meal not found" });

    await rankUserMeals(deletedMeal.userId);
    res.json({ message: "Meal deleted and rankings updated." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
