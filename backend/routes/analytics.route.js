import express from "express";
import {
    updateProductSaleAnalytics,
    updateProductRestockAnalytics,
    updatePageViewAnalytics,
    updateCompletedOrderAnalytics,
    getAnalyticsById,
    createNewAnalyticsRoute
} from "../controllers/analytics.controllers.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/update/sale", protectRoute, adminRoute, updateProductSaleAnalytics);
router.post("/update/restock", protectRoute, adminRoute, updateProductRestockAnalytics);
router.post("/update/pageview", protectRoute, adminRoute, updatePageViewAnalytics);
router.post("/update/completedorder", protectRoute, adminRoute, updateCompletedOrderAnalytics);
router.post("/", protectRoute, adminRoute, createNewAnalyticsRoute);
router.get("/:analyticsId", protectRoute, adminRoute, getAnalyticsById);

export default router;
