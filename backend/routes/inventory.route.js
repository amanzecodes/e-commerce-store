import express from 'express';
import {
    getAllInventory,
    updateStockQuantity,
    getLowStockProducts
} from '../controllers/inventory.controllers.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';  

const router = express.Router();


router.get('/', protectRoute, adminRoute, getAllInventory);
router.put('/:id', protectRoute, adminRoute, updateStockQuantity);
router.get('/low-stock', protectRoute, adminRoute, getLowStockProducts);

export default router;
