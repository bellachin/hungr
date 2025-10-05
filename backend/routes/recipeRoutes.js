import express from 'express';

const router = express.Router();

// Hardcoded recipes for testing
const recipes = [
  {
    id: 1,
    name: "Pasta Primavera",
    description: "Delicious pasta with fresh vegetables and a light garlic sauce.",
    image: "/assets/images/pasta.jpg"
  },
  {
    id: 2,
    name: "Avocado Toast",
    description: "Simple and healthy breakfast with mashed avocado on toasted bread.",
    image: "/assets/images/avocado_toast.jpg"
  },
  {
    id: 3,
    name: "Berry Smoothie",
    description: "A refreshing smoothie made with strawberries, blueberries, and banana.",
    image: "/assets/images/smoothie.jpg"
  },
  {
    id: 4,
    name: "Chicken Salad",
    description: "Light and healthy salad with grilled chicken, greens, and vinaigrette.",
    image: "/assets/images/chicken_salad.jpg"
  }
];

// GET /api/recipes — returns all recipes
router.get('/', (req, res) => {
  res.json({
    success: true,
    recipes
  });
});

export default router;
