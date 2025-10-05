// backend/routes/faqRoutes.js for the food storage list
const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// Get all food storage info
router.get('/all', faqController.getAllFoodStorage);

// Get all categories
router.get('/categories', faqController.getCategories);

// Get foods by category
router.get('/category/:category', faqController.getFoodByCategory);

// Get specific food item
router.get('/food/:foodName', faqController.getFoodItem);

module.exports = router;