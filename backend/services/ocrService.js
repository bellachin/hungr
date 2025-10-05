// backend/services/ocrService.js
const axios = require('axios');
const fs = require('fs').promises;

class OCRService {
  constructor() {
    this.apiKey = process.env.GOOGLE_VISION_API_KEY;
    this.apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`;
    
    if (!this.apiKey) {
      console.error('⚠️  Google Vision API key not found!');
      this.enabled = false;
    } else {
      console.log('✅ Google Vision OCR initialized');
      this.enabled = true;
    }
  }

  /**
   * Extract text from receipt image
   */
  async extractTextFromReceipt(imagePath) {
    if (!this.enabled) {
      return this.mockReceiptData(); // Fallback for demo
    }

    try {
      // Read image and convert to base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Prepare request
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              },
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      };

      // Send to Google Vision
      const response = await axios.post(this.apiUrl, requestBody);
      
      if (response.data.responses && response.data.responses[0]) {
        const visionResponse = response.data.responses[0];
        const fullText = visionResponse.fullTextAnnotation?.text || 
                        visionResponse.textAnnotations?.[0]?.description || '';
        
        // Parse the receipt text
        return this.parseReceiptText(fullText);
      }
      
      return { items: [], rawText: '' };
    } catch (error) {
      console.error('OCR Error:', error.response?.data || error.message);
      return this.mockReceiptData(); // Fallback on error
    }
  }

  /**
   * Parse receipt text to extract food items
   */
  parseReceiptText(rawText) {
    console.log('Raw OCR Text:', rawText);
    
    // Common grocery items to look for
    const foodKeywords = [
      // Meats
      'chicken', 'beef', 'pork', 'turkey', 'bacon', 'sausage', 'ham', 'ground beef',
      'chicken breast', 'chicken thighs', 'steak', 'ribs', 'lamb',
      
      // Seafood
      'salmon', 'tuna', 'shrimp', 'fish', 'cod', 'tilapia', 'crab', 'lobster',
      
      // Dairy
      'milk', 'cheese', 'yogurt', 'butter', 'eggs', 'cream', 'sour cream',
      
      // Produce
      'tomato', 'lettuce', 'onion', 'garlic', 'potato', 'carrot', 'celery',
      'apple', 'banana', 'orange', 'lemon', 'lime', 'avocado', 'spinach',
      'broccoli', 'pepper', 'cucumber', 'mushroom',
      
      // Grains/Pasta
      'rice', 'pasta', 'bread', 'flour', 'oats', 'cereal', 'noodles',
      
      // Pantry
      'oil', 'olive oil', 'salt', 'pepper', 'sugar', 'sauce', 'beans',
      'tomato sauce', 'soy sauce', 'vinegar', 'spices'
    ];

    const lines = rawText.toLowerCase().split('\n');
    const foundItems = [];
    const seenItems = new Set();

    for (const line of lines) {
      // Skip lines with prices (containing $, numbers only, etc.)
      if (line.includes('$') || /^\d+\.\d+$/.test(line.trim())) {
        continue;
      }

      // Check each food keyword
      for (const keyword of foodKeywords) {
        if (line.includes(keyword) && !seenItems.has(keyword)) {
          foundItems.push(keyword);
          seenItems.add(keyword);
        }
      }
    }

    // Also try to extract items that look like product names
    const productLineRegex = /^([A-Z][A-Z\s]+)(?:\s+\d)/gm;
    const matches = rawText.matchAll(productLineRegex);
    
    for (const match of matches) {
      const item = match[1].trim().toLowerCase();
      if (item.length > 2 && !seenItems.has(item)) {
        // Check if it might be food
        const possibleFood = this.isPossibleFood(item);
        if (possibleFood) {
          foundItems.push(item);
          seenItems.add(item);
        }
      }
    }

    return {
      items: foundItems,
      rawText: rawText.substring(0, 500), // First 500 chars for debugging
      count: foundItems.length
    };
  }

  /**
   * Check if a string might be a food item
   */
  isPossibleFood(text) {
    const nonFoodWords = ['total', 'tax', 'subtotal', 'visa', 'mastercard', 
                         'debit', 'credit', 'cash', 'change', 'receipt'];
    
    const lower = text.toLowerCase();
    return !nonFoodWords.some(word => lower.includes(word)) && 
           text.length > 2 && 
           text.length < 30;
  }

  /**
   * Fallback mock data for testing
   */
  mockReceiptData() {
    console.log('Using mock receipt data (no API key)');
    return {
      items: [
        'chicken breast',
        'rice',
        'tomatoes',
        'onions',
        'garlic',
        'olive oil',
        'black pepper',
        'milk',
        'eggs',
        'bread'
      ],
      rawText: 'MOCK DATA - Replace with actual OCR',
      count: 10
    };
  }
}

module.exports = new OCRService();