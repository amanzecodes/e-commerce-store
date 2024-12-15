import express from "express";
import {
  deleteProduct,
  createProduct,
  getAllProducts,
  // getFeaturedProducts,
  // getRecommendedProducts,
  getProductsByCategory,
  // toggleFeaturedProduct,
  getAllProductsForUsers
} from "../controllers/product.controllers.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/public",  getAllProductsForUsers);
router.get("/category/:category", getProductsByCategory);
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
// router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
// router.get("/recommendations", getRecommendedProducts);
// router.get("/featured", getFeaturedProducts);
export default router;
