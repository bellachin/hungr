// backend/controllers/faqController.js
const { foodStorageData } = require('../data/foodStorageData');

// Get all food storage info (returns our static data)
exports.getAllFoodStorage = (req, res) => {
  res.json({
    success: true,
    count: foodStorageData.length,
    data: foodStorageData
  });
};

// Get storage info by category (meat, poultry, or seafood)
exports.getFoodByCategory = (req, res) => {
  const { category } = req.params;
  
  // Filter foods by category
  const foods = foodStorageData.filter(food => 
    food.category.toLowerCase() === category.toLowerCase()
  );
  
  if (foods.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Category not found. Available categories: meat, poultry, seafood' 
    });
  }
  
  res.json({
    success: true,
    category,
    count: foods.length,
    data: foods
  });
};

// Get specific food item
exports.getFoodItem = (req, res) => {
  const { foodName } = req.params;
  
  // Find food by name (case insensitive)
  const food = foodStorageData.find(item => 
    item.foodName.toLowerCase().includes(foodName.toLowerCase())
  );
  
  if (!food) {
    return res.status(404).json({ 
      success: false, 
      message: 'Food item not found' 
    });
  }
  
  res.json({
    success: true,
    data: food
  });
};

// Get list of all categories
exports.getCategories = (req, res) => {
  res.json({
    success: true,
    data: ['meat', 'poultry', 'seafood']
  });
};