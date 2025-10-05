// backend/controllers/receiptController.js
import multer from 'multer';
import ocrService from '../services/ocrService.js';

const upload = multer({ dest: 'uploads/' });

export const scanReceipt = [
  upload.single('receipt'),
  async (req, res) => {
    try {
      const filePath = req.file ? req.file.path : null;
      
      // Get sorted items from OCR + OpenAI
      const sortedItems = await ocrService.extractTextFromReceipt(filePath);
      
      // Store in database if PostgreSQL is connected
      if (req.app.locals.postgresPool) {
        const client = await req.app.locals.postgresPool.connect();
        try {
          await client.query('BEGIN');
          
          // Store all items
          for (const location of ['freezer', 'fridge', 'pantry']) {
            for (const item of sortedItems[location] || []) {
              await client.query(
                'INSERT INTO user_pantry (item_name, location) VALUES ($1, $2)',
                [item, location]
              );
            }
          }
          
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      }
      
      res.json({
        success: true,
        sorted: sortedItems
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
];

export const getInventory = async (req, res) => {
  try {
    if (!req.app.locals.postgresPool) {
      // Return mock data if no database
      return res.json({
        success: true,
        inventory: {
          freezer: ['Ice Cream', 'Frozen Pizza'],
          fridge: ['Milk', 'Chicken', 'Eggs'],
          pantry: ['Rice', 'Bread', 'Pasta']
        }
      });
    }

    const result = await req.app.locals.postgresPool.query(
      'SELECT item_name, location FROM user_pantry ORDER BY location, item_name'
    );
    
    const inventory = {
      freezer: result.rows.filter(i => i.location === 'freezer').map(i => i.item_name),
      fridge: result.rows.filter(i => i.location === 'fridge').map(i => i.item_name),
      pantry: result.rows.filter(i => i.location === 'pantry').map(i => i.item_name)
    };
    
    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};