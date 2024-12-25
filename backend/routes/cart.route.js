import express from "express";
import {
  addToCart,
  removeAllFromCart,
  getCartProducts,
  updateQuantity,
} from "../controllers/cart.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/getCart", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/remove", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);

export default router;
