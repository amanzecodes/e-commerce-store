import express from 'express'
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import { getAnalyticsData, getDailySalesData } from '../controllers/analytics.controllers.js';
const router = express.Router()

router.get('/analytics', protectRoute, adminRoute, async (req, res) => {
    try {
        const adminId = req.user._id;

        // 1. Total Sales (Sum of order totals for products sold by the admin)
        const totalSales = await Order.aggregate([
            { $match: { 'sellerId': adminId } },
            { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
        ]);

        // 2. Total Purchases (Sum of admin's purchases)
        const totalPurchases = await Order.aggregate([
            { $match: { 'buyerId': adminId } },
            { $group: { _id: null, totalPurchases: { $sum: '$totalAmount' } } }
        ]);

        // 3. Sales Returns
        const salesReturns = await Order.aggregate([
            { $match: { 'sellerId': adminId, 'isReturned': true } },
            { $group: { _id: null, salesReturns: { $sum: '$totalAmount' } } }
        ]);

        // 4. Purchase Returns
        const purchaseReturns = await Order.aggregate([
            { $match: { 'buyerId': adminId, 'isReturned': true } },
            { $group: { _id: null, purchaseReturns: { $sum: '$totalAmount' } } }
        ]);

        // 5. Top Selling Products
        const topSellingProducts = await Order.aggregate([
            { $match: { 'sellerId': adminId } },
            { $unwind: '$products' }, // Decompose product array in each order
            { $group: { _id: '$products.productId', totalSold: { $sum: '$products.quantity' } } },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
            { $project: { _id: 0, productName: '$productDetails.name', totalSold: 1 } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 } // Get top 5 selling products
        ]);

        // 6. Weekly Sales and Purchases
        const weeklySales = await Order.aggregate([
            { $match: { sellerId: adminId } },
            { $group: { _id: { $dayOfWeek: '$createdAt' }, totalSales: { $sum: '$totalAmount' } } }
        ]);

        const weeklyPurchases = await Order.aggregate([
            { $match: { buyerId: adminId } },
            { $group: { _id: { $dayOfWeek: '$createdAt' }, totalPurchases: { $sum: '$totalAmount' } } }
        ]);

        res.status(200).json({
            totalSales: totalSales[0]?.totalSales || 0,
            totalPurchases: totalPurchases[0]?.totalPurchases || 0,
            salesReturns: salesReturns[0]?.salesReturns || 0,
            purchaseReturns: purchaseReturns[0]?.purchaseReturns || 0,
            topSellingProducts,
            weeklySales,
            weeklyPurchases,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/analytics/weekly-sales-purchases', protectRoute, adminRoute, async (req, res) => {
    try {
        const adminId = req.user._id;

        // Get the start of the current week (Monday)
        const currentDate = new Date();
        const startOfWeek = new Date(
            currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1) // Monday
        );
        const endOfWeek = new Date(
            currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7) // Sunday
        );

        // Weekly Sales
        const weeklySales = await Order.aggregate([
            { 
                $match: { 
                    sellerId: adminId,
                    createdAt: { $gte: startOfWeek, $lte: endOfWeek } 
                }
            },
            { 
                $group: { 
                    _id: { $dayOfWeek: '$createdAt' }, // Group by day of the week
                    totalSales: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Weekly Purchases
        const weeklyPurchases = await Order.aggregate([
            { 
                $match: { 
                    buyerId: adminId,
                    createdAt: { $gte: startOfWeek, $lte: endOfWeek } 
                }
            },
            { 
                $group: { 
                    _id: { $dayOfWeek: '$createdAt' }, // Group by day of the week
                    totalPurchases: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Format the data for all days of the week (ensure no missing days)
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const salesData = Array(7).fill(0);
        const purchaseData = Array(7).fill(0);

        weeklySales.forEach(item => {
            const dayIndex = item._id - 1; // Convert MongoDB's $dayOfWeek (1-7) to index (0-6)
            salesData[dayIndex] = item.totalSales;
        });

        weeklyPurchases.forEach(item => {
            const dayIndex = item._id - 1;
            purchaseData[dayIndex] = item.totalPurchases;
        });

        // Response format
        const response = daysOfWeek.map((day, index) => ({
            day,
            sales: salesData[index],
            purchases: purchaseData[index]
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching weekly sales and purchases:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;