// backend/services/ocrService.js
import axios from 'axios';
import fs from 'fs/promises';

class OCRService {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.googleVisionKey = process.env.GOOGLE_VISION_API_KEY;
  }

  async extractTextFromReceipt(imagePath) {
    // Use your existing OCR logic or mock for now
    const mockOCRText = `
      GROCERY STORE
      Chicken Breast 2.5 lbs
      Milk 1 gallon
      Rice 5 lbs
      Ice Cream 1 pint
      Lettuce 1 head
      Frozen Pizza 2
      Bread 1 loaf
      Butter 1 lb
      Eggs dozen
    `;
    
    // Extract items from OCR text
    const items = this.parseReceiptText(mockOCRText);
    
    // Use OpenAI to sort items
    const sortedItems = await this.sortItemsWithAI(items);
    
    return sortedItems;
  }

  parseReceiptText(text) {
    // Simple parsing - extract food items
    const lines = text.split('\n').filter(line => line.trim());
    const foodItems = [];
    
    lines.forEach(line => {
      // Skip header/footer lines
      if (!line.includes('STORE') && !line.includes('TOTAL') && line.length > 3) {
        foodItems.push(line.trim());
      }
    });
    
    return foodItems;
  }

  async sortItemsWithAI(items) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a food storage expert. Sort these grocery items into freezer, fridge, or pantry.
                Return ONLY a JSON object in this exact format:
                {
                  "freezer": ["item1", "item2"],
                  "fridge": ["item3", "item4"],
                  "pantry": ["item5", "item6"]
                }`
            },
            {
              role: 'user',
              content: `Sort these items: ${items.join(', ')}`
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const sortedData = JSON.parse(response.data.choices[0].message.content);
      return sortedData;
    } catch (error) {
      console.error('OpenAI sorting error:', error);
      // Fallback to basic sorting
      return this.basicSort(items);
    }
  }

  basicSort(items) {
    const sorted = {
      freezer: [],
      fridge: [],
      pantry: []
    };

    items.forEach(item => {
      const lower = item.toLowerCase();
      if (lower.includes('frozen') || lower.includes('ice cream')) {
        sorted.freezer.push(item);
      } else if (lower.includes('milk') || lower.includes('chicken') || lower.includes('eggs') || lower.includes('butter') || lower.includes('lettuce')) {
        sorted.fridge.push(item);
      } else {
        sorted.pantry.push(item);
      }
    });

    return sorted;
  }
}

export default new OCRService();