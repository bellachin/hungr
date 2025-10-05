// backend/controllers/receiptController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ocrService = require('../services/ocrService');
const spoonacularService = require('../services/spoonacularService');
const pantryService = require('../services/pantryService');
const { foodStorageData } = require('../data/foodStorageData');

// Configure multer (same as before)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/receipts';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `receipt_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

/**
 * Main endpoint: Scan → Import → Store → Get Recipes
 */
exports.scanImportStore = [
  upload.single('image'),
  async (req, res) => {
    try {
      const userId = req.body.userId || 'default_user';
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image provided'
        });
      }

      console.log('📸 Processing receipt:', req.file.filename);

      // Step 1: SCAN - Extract text using OCR
      const ocrResult = await ocrService.extractTextFromReceipt(req.file.path);
      
      if (!ocrResult.items || ocrResult.items.length === 0) {
        await fs.unlink(req.file.path).catch(console.error);
        return res.json({
          success: false,
          message: 'No items found in receipt'
        });
      }

      // Step 2: IMPORT & SORT - Categorize items
      const sortedItems = sortItemsByStorage(ocrResult.items);
      const itemsWithGuidelines = getStorageGuidelines(sortedItems);

      // Step 3: STORE IN DATABASE - Save to pantry
      const itemsToStore = [];
      for (const location of ['freezer', 'fridge', 'pantry']) {
        for (const item of itemsWithGuidelines[location]) {
          itemsToStore.push({
            name: item.name,
            category: item.category || 'general',
            location: location,
            storageTime: item.storageTime,
            tips: item.tips
          });
        }
      }

      // Save to database
      const storedItems = await pantryService.addItemsToPantry(itemsToStore, userId);
      
      // Save receipt record
      await pantryService.saveReceiptRecord({
        text: ocrResult.rawText,
        items: ocrResult.items
      }, userId);

      // Step 4: GET RECIPES - Suggest recipes based on pantry
      let recipes = [];
      if (ocrResult.items.length > 0) {
        try {
          recipes = await spoonacularService.findRecipesByIngredients(
            ocrResult.items.slice(0, 10),
            5
          );
        } catch (error) {
          console.error('Recipe fetch error:', error);
        }
      }

      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(console.error);

      // Return complete response
      res.json({
        success: true,
        message: `Successfully imported ${storedItems.length} items to your pantry!`,
        scannedItems: ocrResult.items,
        pantryItems: storedItems,
        sortedStorage: itemsWithGuidelines,
        recipes: recipes.map(r => ({
          id: r.id,
          name: r.name,
          image: r.image,
          usedIngredients: r.usedIngredients?.map(i => i.name) || [],
          missedIngredients: r.missedIngredients?.map(i => i.name) || []
        }))
      });

    } catch (error) {
      console.error('Scan import store error:', error);
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      res.status(500).json({
        success: false,
        message: 'Error processing receipt',
        error: error.message
      });
    }
  }
];

/**
 * Get user's pantry items
 */
exports.getPantry = async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';
    const location = req.query.location; // optional: filter by location
    
    const items = await pantryService.getPantryItems(userId, location);
    
    res.json({
      success: true,
      count: items.length,
      items: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pantry',
      error: error.message
    });
  }
};

/**
 * Get recipes based on current pantry
 */
exports.getRecipesFromPantry = async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';
    
    // Get all pantry items
    const pantryItems = await pantryService.getPantryItems(userId);
    const ingredients = pantryItems.map(item => item.item_name);
    
    if (ingredients.length === 0) {
      return res.json({
        success: true,
        message: 'No items in pantry',
        recipes: []
      });
    }

    // Get recipe suggestions
    const recipes = await spoonacularService.findRecipesByIngredients(
      ingredients.slice(0, 20), // Use top 20 ingredients
      10
    );

    res.json({
      success: true,
      pantryItemsUsed: ingredients,
      recipes: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting recipes',
      error: error.message
    });
  }
};

// Helper functions (keep your existing ones)
function sortItemsByStorage(items) {
  const sorted = {
    freezer: [],
    fridge: [],
    pantry: []
  };

  const storageRules = {
    freezer: ['ice cream', 'frozen', 'ice'],
    fridge: ['milk', 'cheese', 'yogurt', 'eggs', 'butter', 'chicken', 'beef', 'pork', 
             'fish', 'salmon', 'shrimp', 'lettuce', 'spinach', 'cream', 'juice'],
    pantry: ['rice', 'pasta', 'bread', 'flour', 'sugar', 'salt', 'oil', 'cereal', 
            'beans', 'canned', 'crackers', 'chips', 'cookies']
  };

  items.forEach(item => {
    const lowerItem = item.toLowerCase();
    let location = 'pantry';
    
    if (storageRules.freezer.some(keyword => lowerItem.includes(keyword))) {
      location = 'freezer';
    } else if (storageRules.fridge.some(keyword => lowerItem.includes(keyword))) {
      location = 'fridge';
    }
    
    sorted[location].push({
      name: item,
      location: location
    });
  });

  return sorted;
}

function getStorageGuidelines(sortedItems) {
  const result = {
    freezer: [],
    fridge: [],
    pantry: []
  };

  for (const location of ['freezer', 'fridge', 'pantry']) {
    for (const item of sortedItems[location]) {
      const guideline = foodStorageData.find(food => 
        item.name.toLowerCase().includes(food.foodName.toLowerCase()) ||
        food.foodName.toLowerCase().includes(item.name.toLowerCase())
      );

      if (guideline && guideline.storageGuidelines[location]) {
        result[location].push({
          ...item,
          storageTime: guideline.storageGuidelines[location].time || 'Check guidelines',
          tips: guideline.storageGuidelines[location].tips || []
        });
      } else {
        result[location].push({
          ...item,
          storageTime: 'No data available',
          tips: []
        });
      }
    }
  }

  return result;
}