import express from 'express'
import { salesData, weeklySalesPurchases } from '../controllers/analytics.controllers.js';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router()

router.get('/sales-data', protectRoute, adminRoute, salesData);
router.get('/weekly-sales-purchases', protectRoute, adminRoute, weeklySalesPurchases);

export default router;