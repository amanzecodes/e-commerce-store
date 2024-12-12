import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCheckoutSession, checkoutSuccess } from "../controllers/payment.controllers.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;
