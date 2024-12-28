import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { initiateSubscriptionPayment, verifyPaymentAndSubscribeUser } from "../controllers/subscription.controllers.js";


const router = express.Router();

router.post("/initiateSubscription", protectRoute, initiateSubscriptionPayment)
router.get("/verifySubscription/:reference", verifyPaymentAndSubscribeUser)

export default router;