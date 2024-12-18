// import  cloudinary  from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const sortField = req.query.sort || "name";
    const sortOrder = req.query.order === "desc" ? -1 : 1;

    const products = await Product.find({ userId: req.user._id })
      .populate("userId", "name email")
      .select("name description price image category stock userId")
      .skip(skip)
      .limit(limit)
      .sort({ [sortField]: sortOrder });

    const total = await Product.countDocuments({ userId: req.user._id });

    res.status(200).json({
      products,
      totalRecords: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Error in getAllProducts controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllProductsForAdmin = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("userId", "name")
      .select("name description price image category");
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching public products:", err.message);
    res.status(500).json({ message: "Failed to fetch public products" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    // let cloudinaryResponse = null;

    // if(image) {
    //   cloudinaryResponse = await cloudinary.uploader.upload(image, {folder:"products"})
    // }
    const newProduct = new Product({
      name,
      description,
      price,
      image,
      category,
      userId: req.user._id, // Assuming userId is set by your auth middleware
      stock: stock,
    });

    const savedProduct = await newProduct.save();
    // image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
    res.status(201).json(savedProduct);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const recentProducts = async (req, res) => {
  try {
    // Fetch latest 10 products sorted by createdAt in descending order
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Send the recent products as a response
    res.status(200).json(recentProducts);
  } catch (error) {
    console.error("Error fetching recent products:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // Find and delete the product by ID
    const product = await Product.findByIdAndDelete(req.params.id);

    // Log the product ID for debugging
    console.log(`Attempting to delete product with ID: ${req.params.id}`);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // if (product.image) {
    //   const publicId = product.image.split('/').pop().split(".")[0]; // Extract public ID from the image URL
    //   try {
    //     await cloudinary.uploader.destroy(`products/${publicId}`);
    //     console.log("Deleted image from Cloudinary");
    //   } catch (error) {
    //     console.error("Error deleting image from Cloudinary:", error.message);
    //   }
    // }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found in this category" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getProductsByCategory controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }
    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in the getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product Not Found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const viewProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
