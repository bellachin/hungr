// backend/models/FoodStorageInfo.js
const mongoose = require('mongoose');

const foodStorageSchema = new mongoose.Schema({
  foodName: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['meat', 'poultry', 'seafood', 'dairy', 'produce', 'grains', 'leftovers', 'condiments', 'baked_goods'],
    required: true 
  },
  storageGuidelines: {
    fridge: {
      time: String,  // "3-5 days", "1 week", etc.
      temperature: String,  // "Below 40°F"
      tips: [String]
    },
    freezer: {
      time: String,
      temperature: String,  // "0°F or below"
      tips: [String]
    },
    pantry: {
      time: String,
      temperature: String,  // "Room temperature"
      tips: [String]
    }
  },
  signs_of_spoilage: [String],
  important_notes: [String]
});

module.exports = mongoose.model('FoodStorageInfo', foodStorageSchema);