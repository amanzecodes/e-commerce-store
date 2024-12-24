import express from "express";
import {
  deleteProduct,
  createProduct,
  // getAllProducts,
  getFeaturedProducts,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct,
  getAllProductsForAdmin,
  recentProducts,
  viewProduct,
  getProductsBySearch,
  relatedProducts
} from "../controllers/product.controllers.js";
import { protectRoute, adminRoute, superAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/adminproducts", protectRoute, superAdmin, getAllProductsForAdmin);
router.get("/category/:category", getProductsByCategory);
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
router.get('/recent-products', recentProducts);
router.patch("/:id", protectRoute, superAdmin, toggleFeaturedProduct);
router.get("/recommendations", getRecommendedProducts);
router.get("/featured", getFeaturedProducts);
router.get('/products/:id', viewProduct);
router.get('/searchProducts', getProductsBySearch)
router.get('/related/:productId', relatedProducts);
export default router;
