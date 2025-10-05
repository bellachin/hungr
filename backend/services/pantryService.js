// backend/services/pantryService.js
const { pool } = require('../config/database');

class PantryService {
  /**
   * Add items to pantry after scanning receipt
   */
  async addItemsToPantry(items, userId = 'default_user') {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const addedItems = [];
      
      for (const item of items) {
        const query = `
          INSERT INTO pantry_items 
          (user_id, item_name, category, location, storage_time, storage_tips, from_receipt)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;
        
        const values = [
          userId,
          item.name,
          item.category || 'general',
          item.location || 'pantry',
          item.storageTime || '1 week',
          item.tips || [],
          true
        ];
        
        const result = await client.query(query, values);
        addedItems.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return addedItems;
      
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error adding items to pantry:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Get all items in user's pantry
   */
  async getPantryItems(userId = 'default_user', location = null) {
    try {
      let query = 'SELECT * FROM pantry_items WHERE user_id = $1';
      const values = [userId];
      
      if (location) {
        query += ' AND location = $2';
        values.push(location);
      }
      
      query += ' ORDER BY added_date DESC';
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (err) {
      console.error('Error getting pantry items:', err);
      throw err;
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(itemId, quantity, userId = 'default_user') {
    try {
      const query = `
        UPDATE pantry_items 
        SET quantity = $1, updated_at = NOW()
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [quantity, itemId, userId]);
      return result.rows[0];
    } catch (err) {
      console.error('Error updating item quantity:', err);
      throw err;
    }
  }

  /**
   * Remove item from pantry
   */
  async removeItem(itemId, userId = 'default_user') {
    try {
      const query = 'DELETE FROM pantry_items WHERE id = $1 AND user_id = $2 RETURNING *';
      const result = await pool.query(query, [itemId, userId]);
      return result.rows[0];
    } catch (err) {
      console.error('Error removing item:', err);
      throw err;
    }
  }

  /**
   * Get items expiring soon
   */
  async getExpiringItems(daysAhead = 7, userId = 'default_user') {
    try {
      const query = `
        SELECT * FROM pantry_items 
        WHERE user_id = $1 
        AND expiry_date IS NOT NULL
        AND expiry_date <= NOW() + INTERVAL '${daysAhead} days'
        ORDER BY expiry_date ASC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (err) {
      console.error('Error getting expiring items:', err);
      throw err;
    }
  }

  /**
   * Save scanned receipt record
   */
  async saveReceiptRecord(receiptData, userId = 'default_user') {
    try {
      const query = `
        INSERT INTO scanned_receipts 
        (user_id, receipt_text, items_found, total_items)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const values = [
        userId,
        receiptData.text || '',
        receiptData.items || [],
        receiptData.items?.length || 0
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error('Error saving receipt:', err);
      throw err;
    }
  }
}

module.exports = new PantryService();