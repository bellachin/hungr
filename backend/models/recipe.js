// backend/models/Recipe.js //makes recipes based off the scanned recipes
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
    required: true 
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  prepTime: Number, // in minutes
  cookTime: Number, // in minutes
  servings: Number,
  ingredients: [{
    item: String,
    amount: String,
    essential: { type: Boolean, default: true } // true if required, false if optional
  }],
  instructions: [String],
  tags: [String], // ['quick', 'healthy', 'vegetarian', etc.]
});

module.exports = mongoose.model('Recipe', recipeSchema);