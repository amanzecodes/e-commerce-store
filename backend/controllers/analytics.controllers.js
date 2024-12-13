import { redis } from "../lib/redis.js";
import Analytics from "../models/analytics.model.js";
import User from '../models/user.model.js';

//FOR WHEN A NEW USER IS CREATED
//NOT FOR ANY ROUTES
export const createNewAnalytics = async (analyticsData) => {
    try {
        // Create a new Analytics document with the provided data
        const newAnalytics = new Analytics(analyticsData);

        // Save the new document to the database
        await newAnalytics.save();

        // Return the _id of the newly created analytics document
        return newAnalytics._id;
    } catch (error) {
        throw new Error('Error creating new analytics data: ' + error.message);
    }
};

//This Creates a new Analytics with a route
export const createNewAnalyticsRoute = async (req, res) => {
    const { analyticsData } = req.body; // Get the analytics data from the request body

    if (!analyticsData) {
        return res.status(400).json({ success: false, message: 'Analytics data is required' });
    }

    try {
        // Create a new Analytics document with the provided data
        const newAnalytics = new Analytics(analyticsData);

        // Save the new document to the database
        await newAnalytics.save();

        // Return the _id of the newly created analytics document
        res.status(201).json({
            success: true,
            message: 'New analytics data created successfully',
            data: { analyticsId: newAnalytics._id }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error creating new analytics data',
            error: error.message
        });
    }
};


//Get analytics data from collection
export const getAnalyticsById = async (req, res) => {
    const { analyticsId } = req.params; // Get analyticsId from the request parameters

    if (!analyticsId) {
        return res.status(400).json({ message: "Missing analytics ID" });
    }

    try {
        // Find the analytics data by its ID
        const analyticsData = await Analytics.findById(analyticsId);

        if (!analyticsData) {
            return res.status(404).json({ message: "Analytics data not found" });
        }

        // Return the found analytics data
        res.status(201).json({
            success: true,
            message: 'Analytics data retrieved successfully',
            data: analyticsData
        });
    } catch (error) {
        console.log("Error retrieving analytics data", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//
export const updateProductSaleAnalytics = async (req, res) => {
    const { analyticsId, quantitySold, orderTotal } = req.body;

    if (!analyticsId || !quantitySold || !orderTotal) {
        return res.status(400).json({ message: "Missing required data" });
    }

    try {
        // Find the analytics data by analyticsId
        const analyticsData = await Analytics.findById(analyticsId);

        if (!analyticsData) {
            return res.status(404).json({ message: "Analytics data not found" });
        }

        // Update the analytics data based on the sale
        analyticsData.totalProductsSold += quantitySold;
        analyticsData.totalRevenue += orderTotal;
        analyticsData.availableStock -= quantitySold; // Decrease stock
        analyticsData.totalOrders += 1;
        analyticsData.completedOrders += 1;

        // Save the updated analytics data
        await analyticsData.save();

        res.status(200).json({
            success: true,
            message: 'Product sale analytics updated successfully',
            data: analyticsData
        });
    } catch (error) {
        console.log("Error in updateProductSaleAnalytics controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


//Updates Made When A Product Is Restocked
export const updateProductRestockAnalytics = async (req, res) => {
    const { analyticsId, quantityRestocked } = req.body;

    if (!analyticsId || !quantityRestocked) {
        return res.status(400).json({ message: "Missing required data" });
    }

    try {
        // Find the analytics data by analyticsId
        const analyticsData = await Analytics.findById(analyticsId);

        if (!analyticsData) {
            return res.status(404).json({ message: "Analytics data not found" });
        }

        // Update the analytics data based on the restock
        analyticsData.availableStock += quantityRestocked;

        // Save the updated analytics data
        await analyticsData.save();

        res.status(200).json({
            success: true,
            message: 'Product restocked and analytics updated successfully',
            data: analyticsData
        });
    } catch (error) {
        console.log("Error in updateProductRestockAnalytics controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//For changes made to page views (When a user opens another users page)
export const updatePageViewAnalytics = async (req, res) => {
    const { analyticsId } = req.body;

    if (!analyticsId) {
        return res.status(400).json({ message: "Missing analyticsId" });
    }

    try {
        // Find the analytics data by analyticsId
        const analyticsData = await Analytics.findById(analyticsId);

        if (!analyticsData) {
            return res.status(404).json({ message: "Analytics data not found" });
        }

        // Increment page views by 1
        analyticsData.pageViews += 1;

        // Save the updated analytics data
        await analyticsData.save();

        res.status(200).json({
            success: true,
            message: 'Page view tracked and analytics updated',
            data: analyticsData
        });
    } catch (error) {
        console.log("Error in updatePageViewAnalytics controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//For when an order is co completed
export const updateCompletedOrderAnalytics = async (req, res) => {
    const { analyticsId } = req.body;

    if (!analyticsId) {
        return res.status(400).json({ message: "Missing analyticsId" });
    }

    try {
        // Find the analytics data by analyticsId
        const analyticsData = await Analytics.findById(analyticsId);

        if (!analyticsData) {
            return res.status(404).json({ message: "Analytics data not found" });
        }

        // Update total orders and completed orders
        analyticsData.totalOrders += 1;
        analyticsData.completedOrders += 1;

        // Save the updated analytics data
        await analyticsData.save();

        res.status(200).json({
            success: true,
            message: 'Completed order analytics updated successfully',
            data: analyticsData
        });
    } catch (error) {
        console.log("Error in updateCompletedOrderAnalytics controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

