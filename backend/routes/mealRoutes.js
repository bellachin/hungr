import express from "express";
import Meal from "../models/Meal.js";

const router = express.Router();

// helper: re-rank meals for one user
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

// create meal + trigger ranking
router.post("/", async (req, res) => {
  try {
    const { userId, mealName, rating, ingredients, notes } = req.body;
    const newMeal = new Meal({ userId, mealName, rating, ingredients, notes });
    await newMeal.save();
    await rankUserMeals(userId);
    res.json({ message: "Meal added and ranked (if 5+ meals)." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get meals for one user, highest rank first
router.get("/user/:userId", async (req, res) => {
  const meals = await Meal.find({ userId: req.params.userId })
    .sort({ rankScore: -1, createdAt: -1 });
  res.json(meals);
});

export default router;
