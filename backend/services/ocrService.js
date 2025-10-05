// // backend/services/ocrService.js
// import axios from 'axios';
// import fs from 'fs/promises';

// class OCRService {
//   constructor() {
//     this.openaiKey = process.env.OPENAI_API_KEY;
//     this.googleVisionKey = process.env.GOOGLE_VISION_API_KEY;
    
//     // Check if API keys are present
//     if (!this.googleVisionKey) {
//       console.warn('⚠️  Google Vision API key not found - OCR will use mock data');
//     }
//     if (!this.openaiKey) {
//       console.warn('⚠️  OpenAI API key not found - will use basic sorting');
//     }

//     console.log('🔑 OCR Service Initialized:');
//     console.log('  Google Vision Key:', this.googleVisionKey ? '✅ Found' : '❌ MISSING');
//     console.log('  OpenAI Key:', this.openaiKey ? '✅ Found' : '❌ MISSING');
//   }

//   async extractTextFromReceipt(imagePath) {
//     try {
//       // Use real OCR if API key exists
//       if (this.googleVisionKey && imagePath) {
//         console.log('🔍 Using Google Vision API for OCR...');
        
//         // Read image file
//         const imageBuffer = await fs.readFile(imagePath);
//         const base64Image = imageBuffer.toString('base64');
        
//         // Call Google Vision API
//         const response = await axios.post(
//           `https://vision.googleapis.com/v1/images:annotate?key=${this.googleVisionKey}`,
//           {
//             requests: [{
//               image: {
//                 content: base64Image
//               },
//               features: [
//                 {
//                   type: 'TEXT_DETECTION',
//                   maxResults: 1
//                 },
//                 {
//                   type: 'DOCUMENT_TEXT_DETECTION',
//                   maxResults: 1
//                 }
//               ]
//             }]
//           }
//         );
        
//         // Extract text from response
//         const fullText = response.data.responses[0]?.fullTextAnnotation?.text || 
//                         response.data.responses[0]?.textAnnotations?.[0]?.description || '';
        
//         console.log('📝 OCR Raw Text:', fullText.substring(0, 200) + '...');
        
//         // Parse food items from receipt text
//         const items = this.parseReceiptText(fullText);
//         console.log('🛒 Extracted items:', items);
        
//         // Sort items using OpenAI
//         const sortedItems = await this.sortItemsWithAI(items);
//         return sortedItems;
        
//       } else {
//         console.log('⚠️  Using mock data (no API key or file)');
//         return this.getMockData();
//       }
//     } catch (error) {
//       console.error('❌ OCR Error:', error.response?.data || error.message);
//       console.log('⚠️  Falling back to mock data');
//       return this.getMockData();
//     }
//   }

//   parseReceiptText(text) {
//     const items = [];
//     const lines = text.split('\n');
    
//     // Common grocery item keywords to look for
//     const foodKeywords = [
//       // Proteins
//       'chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna', 'shrimp',
//       'bacon', 'sausage', 'ham', 'eggs',
//       // Dairy
//       'milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream',
//       // Produce
//       'apple', 'banana', 'orange', 'lettuce', 'tomato', 'potato', 'onion',
//       'carrot', 'broccoli', 'spinach', 'pepper', 'cucumber',
//       // Grains
//       'bread', 'rice', 'pasta', 'cereal', 'flour', 'oats',
//       // Frozen
//       'frozen', 'pizza',
//       // Other
//       'juice', 'coffee', 'tea', 'sugar', 'salt', 'oil', 'sauce'
//     ];
    
//     lines.forEach(line => {
//       const cleanLine = line.trim().toLowerCase();
      
//       // Skip empty lines, prices, and store info
//       if (cleanLine.length < 2 || 
//           cleanLine.includes('$') || 
//           cleanLine.includes('total') ||
//           cleanLine.includes('tax') ||
//           cleanLine.includes('store') ||
//           cleanLine.includes('receipt')) {
//         return;
//       }
      
//       // Check if line contains any food keywords
//       const hasFood = foodKeywords.some(keyword => cleanLine.includes(keyword));
      
//       if (hasFood) {
//         // Clean up the line (remove numbers, special chars at the end)
//         let cleanedItem = line.trim()
//           .replace(/\s*\d+\.?\d*\s*$/, '') // Remove trailing numbers
//           .replace(/\s*[\$\@\#\*]+\s*$/, '') // Remove special chars
//           .replace(/\s+/g, ' '); // Normalize spaces
        
//         if (cleanedItem.length > 2) {
//           items.push(cleanedItem);
//         }
//       }
//     });
    
//     // Remove duplicates
//     return [...new Set(items)];
//   }

//   async sortItemsWithAI(items) {
//     if (!this.openaiKey || items.length === 0) {
//       console.log('⚠️  Using basic sorting (no OpenAI key or no items)');
//       return this.basicSort(items);
//     }
    
//     try {
//       console.log('🤖 Using OpenAI to sort items...');
      
//       const response = await axios.post(
//         'https://api.openai.com/v1/chat/completions',
//         {
//           model: 'gpt-3.5-turbo',
//           messages: [
//             {
//               role: 'system',
//               content: `You are a food storage expert. Sort grocery items into freezer, fridge, or pantry.
//                 Rules:
//                 - Frozen items, ice cream → freezer
//                 - Dairy, meat, fresh produce, eggs → fridge  
//                 - Dry goods, canned items, bread, snacks → pantry
                
//                 Return ONLY valid JSON in this format:
//                 {"freezer": ["item1"], "fridge": ["item2"], "pantry": ["item3"]}`
//             },
//             {
//               role: 'user',
//               content: `Sort these grocery items: ${items.join(', ')}`
//             }
//           ],
//           temperature: 0.3,
//           max_tokens: 500
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${this.openaiKey}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       const content = response.data.choices[0].message.content;
//       console.log('🤖 OpenAI response:', content);
      
//       const sorted = JSON.parse(content);
//       return sorted;
      
//     } catch (error) {
//       console.error('❌ OpenAI Error:', error.response?.data || error.message);
//       console.log('⚠️  Falling back to basic sorting');
//       return this.basicSort(items);
//     }
//   }

//   basicSort(items) {
//     const sorted = {
//       freezer: [],
//       fridge: [],
//       pantry: []
//     };
    
//     items.forEach(item => {
//       const lower = item.toLowerCase();
      
//       // Freezer items
//       if (lower.includes('frozen') || 
//           lower.includes('ice cream') || 
//           lower.includes('ice')) {
//         sorted.freezer.push(item);
//       }
//       // Fridge items
//       else if (lower.includes('milk') || 
//                lower.includes('cheese') || 
//                lower.includes('yogurt') ||
//                lower.includes('chicken') || 
//                lower.includes('beef') ||
//                lower.includes('pork') ||
//                lower.includes('eggs') ||
//                lower.includes('butter') ||
//                lower.includes('lettuce') ||
//                lower.includes('fresh')) {
//         sorted.fridge.push(item);
//       }
//       // Everything else goes to pantry
//       else {
//         sorted.pantry.push(item);
//       }
//     });
    
//     return sorted;
//   }

//   getMockData() {
//     // Fallback mock data for testing
//     return {
//       freezer: ['Frozen Pizza', 'Ice Cream'],
//       fridge: ['Milk', 'Chicken Breast', 'Eggs', 'Cheese'],
//       pantry: ['Rice', 'Bread', 'Pasta', 'Cereal']
//     };
//   }
// }

// export default new OCRService();

// backend/services/ocrService.js
import axios from 'axios';
import fs from 'fs/promises';

class OCRService {
  constructor() {
    // Don't load keys in constructor
  }

  getKeys() {
    // Load keys when needed, not at import time
    if (!this.keysLoaded) {
      this.openaiKey = process.env.OPENAI_API_KEY;
      this.googleVisionKey = process.env.GOOGLE_VISION_API_KEY;
      this.keysLoaded = true;
      
      console.log('🔑 Keys loaded:');
      console.log('  Google Vision:', this.googleVisionKey ? '✅' : '❌');
      console.log('  OpenAI:', this.openaiKey ? '✅' : '❌');
    }
    return {
      googleVision: this.googleVisionKey,
      openai: this.openaiKey
    };
  }

  async extractTextFromReceipt(imagePath) {
    // Load keys when method is called
    const keys = this.getKeys();
    
    console.log('📂 Extract called, keys status:', {
      google: !!keys.googleVision,
      openai: !!keys.openai,
      file: !!imagePath
    });
    
    if (!keys.googleVision || !imagePath) {
      console.log('⚠️  Using mock data');
      return this.getMockData();
    }
    
    // Your existing OCR code...
  }
  
  // Rest of your methods...
}

export default new OCRService();