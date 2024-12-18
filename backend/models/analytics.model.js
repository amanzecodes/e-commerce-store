import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    totalProductsSold: {
        type: Number,
        default: 0,
    },
    availableStock: {
        type: Number,
        default: 0,
    },
    totalRevenue: {
        type: Number,
        default: 0,
    },
    totalOrders: {
        type: Number,
        default: 0,
    },
    completedOrders: {
        type: Number,
        default: 0,
    },
    pageViews: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
