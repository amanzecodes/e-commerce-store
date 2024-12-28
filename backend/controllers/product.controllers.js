import  cloudinary  from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProductsForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "name",
      order = "asc",
      category,
      minPrice,
      maxPrice,
      inStock,
    } = req.query;
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: order === "asc" ? 1 : -1 };

    const filter = {};
    if (category) filter.category = category;
    if (minPrice) filter.price = { $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (inStock !== undefined)
      filter.stock = { $gte: inStock === "true" ? 1 : 0 };

    const products = await Product.find(filter)
      .populate("userId", "name email")
      .select("name description price image category stock")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({ totalProducts, totalPages, currentPage: Number(page), products });
  } catch (err) {
    console.error("Error fetching products for admin:", err.message);
    res.status(500).json({ message: "Failed to fetch products" });
  };
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category || !stock) {
      throw new Error("All fields are required");
    }

    let cloudinaryResponse = null;

    // Check if an image file is uploaded
    if (req.file) {
      cloudinaryResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
      category,
      userId: req.user._id,
      stock: stock,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    console.log(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      // Extract the public ID from the image URL
      const publicId = product.image
          .split('/').slice(-2, -1) 
          .concat(product.image.split('/').pop().split('.')[0]); 
      try {
          await cloudinary.uploader.destroy(publicId); // Use only the public ID
          console.log("Deleted image from Cloudinary");
      } catch (error) {
          console.log("Error deleting image from Cloudinary", error.message);
      }
  }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found in this category" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    //.lean() is going to return a plain javascript object instead of a mongoDB doucument
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

      await updateFeaturedProductsCache();
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
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.log("Error in viewProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsBySearch = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query; // Defaults to page 1, 10 items per page
    const skip = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .skip(skip)
      .limit(Number(limit));

    const totalResults = await Product.countDocuments({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    const totalPages = Math.ceil(totalResults / limit);

    res.json({
      totalResults,
      totalPages,
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    console.error("Error in getProductsBySearch:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const relatedProducts = async (req, res) => {
  const { productId } = req.params;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find related products by category
    const relatedProducts = await Product.find({
      $or: [
        { category: product.category },
      ],
      _id: { $ne: product._id } // Exclude the current product
    }).limit(10); // Limit to 10 related products

    res.status(200).json(relatedProducts);
  } catch (error) {
    console.error('Error fetching related products:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const recentProducts = async (req, res) => {
  try {
    // Fetch the most recent products (e.g., the last 10 added)
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .limit(10); // Limit the result to 10 products

    res.status(200).json({
      success: true,
      data: recentProducts,
    });
  } catch (error) {
    console.error("Error fetching recent products:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent products",
    });
  }
};