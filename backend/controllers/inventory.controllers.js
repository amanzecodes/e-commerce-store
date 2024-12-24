import Inventory from "../models/inventory.model.js";
import User from "../models/user.model.js";

// Controller for POST /inventory (Create new inventory stock)
export const createInventoryStock = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming the user ID is retrieved from the auth middleware

        // Extract inventory details from the request body
        const { name, description, price, quantity, category, image } = req.body;

        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: "Name and price are required",
            });
        }

        // Create a new inventory item
        const newInventory = new Inventory({
            name,
            description,
            price,
            quantity: quantity || 0, // Default to 0 if quantity is not provided
            category,
            image,
        });

        // Save the inventory item to the database
        const savedInventory = await newInventory.save();

        // Add the new inventory ID to the user's inventory list
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.inventory.push(savedInventory._id); // Add inventory ID to the user's list
        await user.save(); // Save the updated user document

        res.status(201).json({
            success: true,
            message: "Inventory stock created successfully",
            data: savedInventory,
        });
    } catch (error) {
        console.error("Error creating inventory stock:", error.message);
        res.status(500).json({
            success: false,
            message: "Error creating inventory stock",
            error: error.message,
        });
    }
};

// Controller for GET /inventory
export const getInventoryOverview = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming the user ID is retrieved from the auth middleware
        const user = await User.findById(userId); // Fetch the user object

        if (!user || !user.inventory) {
            return res.status(404).json({
                success: false,
                message: "User or inventory not found",
            });
        }

        // Fetch the inventory objects based on the IDs stored in the user's inventory list
        const inventoryList = await Inventory.find({ _id: { $in: user.inventory } });

        res.status(200).json({
            success: true,
            message: "Inventory overview fetched successfully",
            data: inventoryList,
        });
    } catch (error) {
        console.error("Error fetching inventory overview:", error.message);
        res.status(500).json({
            success: false,
            message: "Error fetching inventory overview",
            error: error.message,
        });
    }
};


// Controller for PUT /inventory/:id
export const updateStockQuantity = async (req, res) => {
    const { id } = req.params; // Inventory item ID
    const { quantity } = req.body; // New quantity to set
    const userId = req.user.id; // User ID from auth middleware

    if (quantity === undefined) {
        return res.status(400).json({ success: false, message: "Quantity is required" });
    }

    try {
        const user = await User.findById(userId); // Fetch the user
        if (!user || !user.inventory.includes(id)) {
            return res.status(404).json({ success: false, message: "Product not found in user's inventory" });
        }

        const product = await Inventory.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        product.quantity = quantity; // Update the quantity
        product.updatedAt = Date.now(); // Update the timestamp
        await product.save();

        res.status(200).json({
            success: true,
            message: "Stock quantity updated successfully",
            data: product,
        });
    } catch (error) {
        console.error("Error updating stock quantity:", error.message);
        res.status(500).json({
            success: false,
            message: "Error updating stock quantity",
            error: error.message,
        });
    }
};

// Controller for GET /inventory/low-stock
export const getLowStockProducts = async (req, res) => {
    const LOW_STOCK_THRESHOLD = 10; // Default threshold for low stock
    const userId = req.user.id; // User ID from auth middleware

    try {
        const user = await User.findById(userId); // Fetch the user
        if (!user || !user.inventory) {
            return res.status(404).json({
                success: false,
                message: "User or inventory not found",
            });
        }

        const lowStockProducts = await Inventory.find({
            _id: { $in: user.inventory }, // Filter by the user's inventory
            quantity: { $lte: LOW_STOCK_THRESHOLD }, // Low stock filter
        });

        res.status(200).json({
            success: true,
            message: "Low stock products fetched successfully",
            data: lowStockProducts,
        });
    } catch (error) {
        console.error("Error fetching low stock products:", error.message);
        res.status(500).json({
            success: false,
            message: "Error fetching low stock products",
            error: error.message,
        });
    }
};