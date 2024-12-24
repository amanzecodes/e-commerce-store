import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { addToWishlist, viewWishlist } from '../controllers/wishlist.controllers.js';
import { removeFromWishlist } from '../controllers/wishlist.controllers.js';
const router = express.Router();

router.post('/addToWishlist/:productId', protectRoute, addToWishlist);
router.get('/viewWishlist', protectRoute, viewWishlist);
router.delete('/removeFromWishlist/:productId', protectRoute, removeFromWishlist);

export default router;