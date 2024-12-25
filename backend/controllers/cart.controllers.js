import Product from "../models/product.model.js";
// import User from "../models/user.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    //add quantity for each products
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.product.equals(product.id)
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;


    if (!productId || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Product ID and valid quantity are required." });
    }

    const user = req.user;

    // Validate user
    if (!user) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    // Find product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Check product stock
    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Requested quantity exceeds available stock. Only ${product.stock} left.`,
      });
    }

    // Check if the product already exists in the cart
    const existingItem = user.cartItems.find((item) =>
      item.product.equals(productId)
    );

    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        console.log(existingItem.quantity)
        return res.status(400).json({
          message: "Total quantity exceeds available stock.",
        });
      }

      existingItem.quantity += quantity;
    } else {
      user.cartItems.push({ quantity, product: productId });
    }
    await user.save();

    res.status(200).json({
      message: "Product added to cart successfully.",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.error("Error in addToCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id === productId);
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    console.log(user._id);
    console.log(user.cartItems._id);

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        res.json(cartItems);
      }
      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
