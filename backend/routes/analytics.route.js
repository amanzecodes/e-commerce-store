import Order from "../models/order.model.js"; 
// import Product from "./models/Product.js"
import express from 'express'
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
const router = express.Router();
router.get("/dashboard", protectRoute, adminRoute, async (req, res) => {
    try {
      // 1. Calculate Total Sales
      const totalSales = await Order.aggregate([
        { $match: { paymentStatus: "Completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
  
      // 2. Calculate Total Purchases
      const totalPurchases = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
  
      // 3. Calculate Sales Return
      const salesReturn = await Order.aggregate([
        { $match: { isReturned: true } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
  
      // 4. Weekly Sales & Purchases
      const weeklySales = await Order.aggregate([
        {
          $group: {
            _id: { $week: "$createdAt" },
            sales: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
      // 5. Top-Selling Products
      const topProducts = await Order.aggregate([
        { $unwind: "$products" },
        { $group: { _id: "$products.product", totalSold: { $sum: "$products.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products", // Name of the Product collection
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            name: "$productDetails.name",
            totalSold: 1,
          },
        },
      ]);
  
    
      res.json({
        sales: totalSales[0]?.total || 0,
        purchases: totalPurchases[0]?.total || 0,
        salesReturn: salesReturn[0]?.total || 0,
        weeklySales,
        topProducts,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

export default router;