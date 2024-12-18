import { redis } from "../lib/redis.js";
import  cloudinary  from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); //find all products
    res.json({ products });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByIds = async (req, res) => {
  try {
    // Extract product IDs from the request body
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Invalid or missing product IDs" });
    }

    // Fetch products with the given IDs
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for the given IDs" });
    }

    res.json({ products });
  } catch (error) {
    console.log("Error in getProductsByIds controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    } 

    //if not in redis, fetch from mongodb
    //.lean() is going to return a plain javascript object instead of a mongoDB doucument
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if(!featuredProducts) {
        return res.status(404).json({ message: "No featured products found"})
    }

    //store in redis for future quick access

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts)

  } catch (error) {
    console.log("Error in the getFeaturedProducts controller", error.message)
    res.status(500).json({message: "Server Error",error: error.message})
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;

    if(image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {folder:"products"})
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
      category
    })

    res.status(201).json(product)
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message})
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    console.log(req.params.id);

    if(!product) {
      return res.status(404).json({ message: "Product not found"})
    }

    if(product.image) {
      const publicId = product.image.split('/').pop().split(".")[0];
       try {
        await cloudinary.uploader.destroy(`products/${publicId}`)
        console.log("Deleted image from cloudinary")
       } catch (error) {
        console.log("error deleting image from cloudinary")
       }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "product deleted successfully"})
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message)
    res.status(500).json({ message: "Server error",error: error.message})
  }
}

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: {size:3}
      },
      {
        $project: {
        _id:1,
        name:1,
        description:1,
        image:1,
        price:1
        }
      }
    ])

    res.json(products)
  } catch (error) {
     console.log("Error in getRecommendedProducts controller", error.message);
     res.status(500).json({ message: "Server error", error: error.message})
  }
}

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category })
    res.json(products)
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message)
  }
}

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if(product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();

      await updateFeaturedProductsCache();
      res.json(updatedProduct)
    } else {
      res.status(404).json({ message: "Product Not Found"})
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message})
  }
}

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true}).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts)); 
  } catch (error) {
    console.log("Error in update cache function")
  }
}