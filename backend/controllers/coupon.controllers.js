import Coupon from '../models/coupon.model.js'
import Order from '../models/order.model.js'


export const generateCoupon = async (req, res) => {
  const { productId, discount, expiryDate } = req.body;

  // Validate required fields
  if (!productId || !discount || !expiryDate) {
    return res.status(400).json({ success: false, message: "All fields are required" });
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
    const { orderId, couponCode } = req.body;
   const buyerId = req.user._id;
    try {
      // Find the coupon by code and check if it is active
      const coupon = await Coupon.findOne({ giftCode: couponCode, isActive: true });
  
      if (!coupon) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired coupon" });
      }
  
      // Check if the coupon has expired
      if (new Date(coupon.expiryDate) < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon has expired" });
      }
  
      // Check if the coupon has already been used by the buyer
      if (coupon.usedBy && coupon.usedBy.includes(buyerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon already used by this buyer" });
      }
  
      // Find the order by ID
      const order = await Order.findById(orderId).populate("products.product");
  
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
  
      // Check if the coupon is valid for the product(s) in the order
      const isValidForProduct = order.products.some(
        (orderProduct) => String(orderProduct.product._id) === String(coupon.productId)
      );
  
      if (!isValidForProduct) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon is not valid for this product" });
      }
  
      // Calculate the discount for the specific product
      const productToDiscount = order.products.find(
        (orderProduct) => String(orderProduct.product._id) === String(coupon.productId)
      );
  
      const productPrice = productToDiscount.product.price * productToDiscount.quantity;
      const discount = (coupon.discount / 100) * productPrice;
      const finalAmount = order.totalAmount - discount;
  
      // Update the order with the coupon and final amount
      order.coupon = coupon._id;
      order.discount = (order.discount || 0) + discount; // Accumulate discount if necessary
      order.finalAmount = finalAmount;
  
      await order.save();
  
      // Add the buyer to the usedBy list and save the coupon
      coupon.usedBy = coupon.usedBy || [];
      coupon.usedBy.push(buyerId);
      await coupon.save();
  
      res.status(200).json({
        success: true,
        message: "Coupon applied successfully",
        data: { orderId: order._id, discount, finalAmount },
      });
    } catch (error) {
      console.error("Error applying coupon:", error.message);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };