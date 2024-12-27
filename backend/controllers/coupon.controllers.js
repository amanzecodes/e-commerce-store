import Coupon from '../models/coupon.model.js'
import Order from '../models/order.model.js'

export const generateCoupon = async (req, res) => {
    const { productId, discount, expiryDate } = req.body;
    
    const random = Math.floor(100000 + Math.random() * 900000).toString();
  
    const giftCode = "GIFT" + random;
    try {
      const newCoupon = new Coupon({ productId, giftCode, discount, expiryDate, isActive });
      await newCoupon.save();
      res.status(201).json({ success: true, data: newCoupon });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  export const applyCoupon = async (req, res) => {
    const { orderId, couponCode, buyerId } = req.body;
  
    try {
      // Find the coupon by code and check if it is active
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
  
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
      if (coupon.usedBy.includes(buyerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon already used by this buyer" });
      }
  
      // Find the order by ID
      const order = await Order.findById(orderId);
  
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
  
      
      // Calculate the discount
      const discount = (coupon.discount / 100) * order.totalAmount;
      const finalAmount = order.totalAmount - discount;
      
  
      // Update the order with the coupon and final amount
      order.coupon = coupon._id;
      order.discount = discount;
      order.finalAmount = finalAmount;
  
      await order.save();
  
      // Add the buyer to the usedBy list and save the coupon
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
  }