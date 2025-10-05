import express from "express";
import Meal from "../models/Meal.js";

const router = express.Router();

// Get all meals
router.get("/", async (req, res) => {
  try {
    const meals = await Meal.find();
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new meal
router.post("/", async (req, res) => {
  try {
    const newMeal = new Meal(req.body);
    await newMeal.save();
    res.json({ message: "Meal added successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a meal
router.put("/:id", async (req, res) => {
  try {
    await Meal.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Meal updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a meal
router.delete("/:id", async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id);
    res.json({ message: "Meal deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
