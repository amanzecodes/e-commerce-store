import express from "express";
import axios from "axios";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
    createSubaccount,
    initiatePayment,
    verifyPayment,
    webHook
} from "../controllers/payment.controllers.js";

const router = express.Router();
router.post("/create-subaccount", protectRoute, adminRoute, createSubaccount);
router.post('/initiate-payment', protectRoute, initiatePayment);
router.get('/verify/:reference', verifyPayment);
router.post("/webhook", webHook)
export default router;