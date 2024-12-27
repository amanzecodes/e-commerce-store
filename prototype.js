const express = require("express");
const router = express.Router();
const Coupon = require("../models/coupon");
const Order = require("../models/order");

router.post("/coupons", async (req, res) => {
  const { discount, expiryDate, isActive } = req.body;
  const random = Math.floor(100000 + Math.random() * 900000).toString();

  const giftCode = "GIFT" + random;
  try {
    const newCoupon = new Coupon({ giftCode, discount, expiryDate, isActive });
    await newCoupon.save();
    res.status(201).json({ success: true, data: newCoupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Route to apply a coupon to an order
router.post("/apply-coupon", async (req, res) => {
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
});

// Route to update a coupon
router.put("/coupons/:id", async (req, res) => {
  const { id } = req.params;
  const { code, discount, expiryDate, isActive } = req.body;

  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { code, discount, expiryDate, isActive },
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedCoupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Route to delete a coupon
router.delete("/coupons/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Coupon.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
