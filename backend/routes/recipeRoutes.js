// // backend/routes/receiptRoutes.js
// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/receipts');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `receipt_${Date.now()}${path.extname(file.originalname)}`);
//   }
// });

// const upload = multer({ storage });

// export function createReceiptRoutes(postgresPool) {
//   const router = express.Router();

//   // Scan and store receipt
//   router.post('/scan-import-store', upload.single('image'), async (req, res) => {
//     try {
//       if (!postgresPool) {
//         return res.status(500).json({
//           success: false,
//           message: 'Database not connected'
//         });
//       }

//       // Mock OCR result for testing
//       const mockItems = [
//         { name: 'chicken breast', location: 'fridge' },
//         { name: 'rice', location: 'pantry' },
//         { name: 'milk', location: 'fridge' }
//       ];

//       // Store in PostgreSQL
//       const client = await postgresPool.connect();
      
//       try {
//         await client.query('BEGIN');
        
//         for (const item of mockItems) {
//           await client.query(
//             `INSERT INTO pantry_items (item_name, location) VALUES ($1, $2)`,
//             [item.name, item.location]
//           );
//         }
        
//         await client.query(
//           `INSERT INTO scanned_receipts (items_found, total_items) VALUES ($1, $2)`,
//           [mockItems.map(i => i.name), mockItems.length]
//         );
        
//         await client.query('COMMIT');
        
//         res.json({
//           success: true,
//           message: 'Items stored in pantry',
//           items: mockItems
//         });
//       } catch (err) {
//         await client.query('ROLLBACK');
//         throw err;
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error processing receipt',
//         error: error.message
//       });
//     }
//   });

//   // Get pantry items
//   router.get('/pantry', async (req, res) => {
//     try {
//       if (!postgresPool) {
//         return res.status(500).json({
//           success: false,
//           message: 'Database not connected'
//         });
//       }

//       const result = await postgresPool.query(
//         'SELECT * FROM pantry_items ORDER BY added_date DESC'
//       );
      
//       res.json({
//         success: true,
//         items: result.rows
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error fetching pantry',
//         error: error.message
//       });
//     }
//   });

//   return router;
// }

// // Default export for backward compatibility
// const router = express.Router();
// router.get('/test', (req, res) => {
//   res.json({ message: 'Receipt routes working' });
// });

// export default router;

// backend/routes/recipeRoutes.js
// backend/routes/recipeRoutes.js
// backend/routes/receiptRoutes.js
import express from 'express';
import { scanReceipt, getInventory } from '../controllers/receiptController.js';

const router = express.Router();

router.post('/scan', scanReceipt);
router.get('/inventory', getInventory);

export default router;