import express from 'express'
import { generateCoupon, applyCoupon } from '../controllers/coupon.controllers.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router()

router.post("/generateCoupons", protectRoute, adminRoute, generateCoupon);
router.post("/apply-coupon", protectRoute, applyCoupon);

export default router;