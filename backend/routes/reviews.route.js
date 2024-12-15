import express from "express";
import {
  addReview,
  editReview,
  getReview,
  deleteReview,
  averageReview,
} from "../controllers/review.controllers.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:productId", getReview);
router.post("/:productId", protectRoute, addReview);
router.put("/:id", protectRoute, editReview);
router.delete("/:id", protectRoute, deleteReview);
router.get("/:productId/average-rating", averageReview);

export default router;
