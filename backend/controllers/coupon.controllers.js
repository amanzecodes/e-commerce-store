import Coupon from "../models/coupon.model.js";
import User from "../models/user.model.js";

export const generateCoupon = async (req, res) => {
  const { productId, discount, expiryDate } = req.body;

  // Validate required fields
  if (!productId || !discount || !expiryDate) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Generate a unique gift code
    let giftCode;
    let isUnique = false;

    while (!isUnique) {
      const random = Math.floor(100000 + Math.random() * 900000).toString();
      giftCode = "GIFT" + random;

      // Check for uniqueness
      const existingCoupon = await Coupon.findOne({ giftCode });
      if (!existingCoupon) isUnique = true;
    }

    // Create the coupon
    const newCoupon = new Coupon({
      productId,
      giftCode,
      discount,
      expiryDate: new Date(expiryDate), // Ensure date format
      isActive: true, // Default value
    });

    await newCoupon.save();
    res.status(201).json({ success: true, data: newCoupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyCoupon = async (req, res) => {
  const { couponCode } = req.body;
  const buyerId = req.user._id;

  try {
    const coupon = await Coupon.findOne({
      giftCode: couponCode,
      isActive: true,
    });

    if (!coupon) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired coupon" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon has expired" });
    }

    const user = await User.findById(buyerId).populate("cartItems.product");

    if (!user || user.cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const cartProduct = user.cartItems.find(
      (item) => String(item.product) === String(coupon.productId)
    );

    if (!cartProduct) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Coupon is not valid for any product in the cart",
        });
    }

    const productPrice = cartProduct.product.price * cartProduct.quantity;
    const discount = (coupon.discount / 100) * productPrice;
    const finalProductPrice = productPrice - discount; // Calculate the final price after discount

    // Update the cart's total discount and mark the coupon as used
    const cartTotal = user.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
    const finalAmount = cartTotal - discount;

    // Update the coupon usage
    coupon.usedBy = coupon.usedBy || [];
    coupon.usedBy.push(buyerId);
    await coupon.save();

    // Optionally update the user's cart with the discounted product price
    cartProduct.product.price = finalProductPrice / cartProduct.quantity; // Update product price in cart
    await user.save(); // Save updated user cart

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        discount,
        finalAmount,
        updatedProductPrice: finalProductPrice, // Return updated product price
      },
    });
  } catch (error) {
    console.error("Error applying coupon:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
