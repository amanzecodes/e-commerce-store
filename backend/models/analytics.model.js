import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    totalProductsSold: {
        type: Number,
        default: 0,
        description: 'Total number of products sold'
    },
    availableStock: {
        type: Number,
        default: 0,
        description: 'Number of products currently in stock'
    },
    totalRevenue: {
        type: Number,
        default: 0,
        description: 'Total revenue generated'
    },
    totalOrders: {
        type: Number,
        default: 0,
        description: 'Total number of orders placed'
    },
    completedOrders: {
        type: Number,
        default: 0,
        description: 'Total number of completed orders'
    },
    pageViews: {
        type: Number,
        default: 0,
        description: 'Total number of page views'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        description: 'Timestamp when analytics data was recorded'
    }
}, { timestamps: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
