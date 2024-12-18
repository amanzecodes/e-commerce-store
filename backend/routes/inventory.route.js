import express from 'express';
import {
    createInventoryStock,
    getInventoryOverview,
    updateStockQuantity,
    getLowStockProducts
} from '../controllers/inventoryController.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';  // Assuming you have these middlewares

const router = express.Router();

router.post('/create', protectRoute, adminRoute, createInventoryStock);
router.get('/', protectRoute, adminRoute, getInventoryOverview);
router.put('/:id', protectRoute, adminRoute, updateStockQuantity);
router.get('/low-stock', protectRoute, adminRoute, getLowStockProducts);

export default router;
