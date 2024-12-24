import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAllInventory = async (req, res) => {
  const sellerId = req.user._id;
  const { page = 1, limit = 10, status, category } = req.query; // Default page=1 and limit=10 frontend-dev can set it anything they want though

  try {
    const skip = (page - 1) * limit;

    let query = { userId: sellerId };
    console.log(query);

    
    if (status) {
      if (status === "in stock") {
        query.stock = { $gt: 0 };
      } else if (status === "out of stock") {
        query.stock = 0;
      }
    }

    if (category) {
      query.category = category;
    }

    // Fetch the inventory with server-side pagination
    const inventory = await Product.find(query)
      .select("name stock category price")
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get the total count of documents to determine the number of products to be displayed
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      data: inventory,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch inventory", error: error.message });
  }
};

export const updateStockQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Quantity is required" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product.stock = quantity;
    product.updatedAt = Date.now();
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
  const LOW_STOCK_THRESHOLD = 10;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const lowStockProducts = await Product.find({
      userId: userId,
      stock: { $lte: LOW_STOCK_THRESHOLD },
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
