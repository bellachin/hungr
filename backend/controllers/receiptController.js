// backend/controllers/receiptController.js
import multer from 'multer';
import ocrService from '../services/ocrService.js';
import fs from 'fs/promises';

const upload = multer({ dest: 'uploads/' });

export const scanReceipt = [
  upload.single('receipt'),
  async (req, res) => {
    try {
      console.log('📸 Receipt scan endpoint hit');
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }
      
      const filePath = req.file.path;
      const sortedItems = await ocrService.extractTextFromReceipt(filePath);
      
      // Store in database
      if (req.app.locals.postgresPool) {
        const client = await req.app.locals.postgresPool.connect();
        try {
          await client.query('BEGIN');
          
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
      
      // Clean up file
      await fs.unlink(filePath).catch(console.error);
      
      res.json({
        success: true,
        sorted: sortedItems
      });
      
    } catch (error) {
      console.error('❌ Scan error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message
      });
    }
  }
];

export const getInventory = async (req, res) => {
  try {
    if (!req.app.locals.postgresPool) {
      return res.json({
        success: false,
        message: 'Database not connected',
        inventory: { freezer: [], fridge: [], pantry: [] }
      });
    }

    const result = await req.app.locals.postgresPool.query(
      'SELECT DISTINCT item_name, location FROM user_pantry ORDER BY location, item_name'
    );
    
    const inventory = {
      freezer: result.rows.filter(i => i.location === 'freezer').map(i => i.item_name),
      fridge: result.rows.filter(i => i.location === 'fridge').map(i => i.item_name),
      pantry: result.rows.filter(i => i.location === 'pantry').map(i => i.item_name)
    };
    
    res.json({ 
      success: true, 
      inventory,
      totalItems: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Inventory error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { itemName, location } = req.body;
    
    if (!req.app.locals.postgresPool) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    const result = await req.app.locals.postgresPool.query(
      'DELETE FROM user_pantry WHERE item_name = $1 AND location = $2',
      [itemName, location]
    );
    
    res.json({
      success: true,
      message: `Removed ${itemName} from ${location}`,
      rowsDeleted: result.rowCount
    });
    
  } catch (error) {
    console.error('❌ Remove item error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const clearInventory = async (req, res) => {
  try {
    if (!req.app.locals.postgresPool) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    await req.app.locals.postgresPool.query('DELETE FROM user_pantry');
    
    res.json({
      success: true,
      message: 'All inventory cleared'
    });
    
  } catch (error) {
    console.error('❌ Clear inventory error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};