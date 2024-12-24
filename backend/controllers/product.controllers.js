// import { redis } from "../lib/redis.js";
// import  cloudinary  from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id }) 
    .populate('userId', 'name email') 
    .select('name description price image category userId'); 
    
    res.json({products: products});
  } catch (error) {
    console.error("Error in getAllProducts controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllProductsForUsers = async (req, res) => {
  try {
      const products = await Product.find({})
          .populate('userId', 'name email')
          .select('name description price image category');

      res.status(200).json(products);
  } catch (err) {
      console.error('Error fetching public products:', err.message);
      res.status(500).json({ message: 'Failed to fetch public products' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
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
  userId: req.user._id// Assuming userId is set by your auth middleware
});

const savedProduct = await newProduct.save();

    // image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
    

    res.status(201).json(savedProduct)
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
    const product = await Product.findByIdAndDelete(req.params.id);
    console.log(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // if(product.image) {
    //   const publicId = product.image.split('/').pop().split(".")[0];
    //    try {
    //     await cloudinary.uploader.destroy(`products/${publicId}`)
    //     console.log("Deleted image from cloudinary")
    //    } catch (error) {
    //     console.log("error deleting image from cloudinary")
    //    }
    // }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

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
    console.log("Error in getProductsByCategory controller", error.message)
  }
}


// export const getFeaturedProducts = async (req, res) => {
//   try {
//     let featuredProducts = await redis.get("featured_products");
//     if (featuredProducts) {
//       return res.json(JSON.parse(featuredProducts));
//     } 

//     //if not in redis, fetch from mongodb
//     //.lean() is going to return a plain javascript object instead of a mongoDB doucument
//     featuredProducts = await Product.find({ isFeatured: true }).lean();

//     if(!featuredProducts) {
//         return res.status(404).json({ message: "No featured products found"})
//     }

//     //store in redis for future quick access

//     await redis.set("featured_products", JSON.stringify(featuredProducts));

//     res.json(featuredProducts)

//   } catch (error) {
//     console.log("Error in the getFeaturedProducts controller", error.message)
//     res.status(500).json({message: "Server Error",error: error.message})
//   }
// };

// export const getRecommendedProducts = async (req, res) => {
//   try {
//     const products = await Product.aggregate([
//       {
//         $sample: {size:3}
//       },
//       {
//         $project: {
//         _id:1,
//         name:1,
//         description:1,
//         image:1,
//         price:1
//         }
//       }
//     ])

//     res.json(products)
//   } catch (error) {
//      console.log("Error in getRecommendedProducts controller", error.message);
//      res.status(500).json({ message: "Server error", error: error.message})
//   }
// }

// export const toggleFeaturedProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if(product) {
//       product.isFeatured = !product.isFeatured;
//       const updatedProduct = await product.save();

//       await updateFeaturedProductsCache();
//       res.json(updatedProduct)
//     } else {
//       res.status(404).json({ message: "Product Not Found"})
//     }
//   } catch (error) {
//     console.log("Error in toggleFeaturedProduct controller", error.message);
//     res.status(500).json({ message: "Server error", error: error.message})
//   }
// }

// async function updateFeaturedProductsCache() {
//   try {
//     const featuredProducts = await Product.find({ isFeatured: true}).lean();
//     await redis.set("featured_products", JSON.stringify(featuredProducts)); 
//   } catch (error) {
//     console.log("Error in update cache function")
//   }
// }