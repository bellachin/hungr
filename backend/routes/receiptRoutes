// backend/routes/receiptRoutes.js
import express from 'express';
import { scanReceipt, getInventory, removeItem, clearInventory } from '../controllers/receiptController.js';

const router = express.Router();

router.post('/scan', scanReceipt);
router.get('/inventory', getInventory);
router.delete('/remove-item', removeItem);
router.delete('/clear-inventory', clearInventory);

export default router;