import express from "express";
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js'
import { getNotifications, markNotificationsAsRead } from "../controllers/notification.controllers.js";


const router = express.Router();
router.get("/getNotification", getNotifications);
router.put("/api/notifications/read", protectRoute, adminRoute, markNotificationsAsRead)

export default router;
