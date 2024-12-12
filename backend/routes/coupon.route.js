import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js'
import { getCoupon, validateCoupon } from '../controllers/coupon.controllers.js'

const router = express.Router()

router.get('/', protectRoute, getCoupon)
router.get('/', protectRoute, validateCoupon)

export default router;