// const express = require("express");
// const router = express.Router();
// const Coupon = require("../models/coupon");
// const Order = require("../models/order");



// // Route to update a coupon
// router.put("/coupons/:id", async (req, res) => {
//   const { id } = req.params;
//   const { code, discount, expiryDate, isActive } = req.body;

//   try {
//     const updatedCoupon = await Coupon.findByIdAndUpdate(
//       id,
//       { code, discount, expiryDate, isActive },
//       { new: true }
//     );
//     res.status(200).json({ success: true, data: updatedCoupon });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// });

// // Route to delete a coupon
// router.delete("/coupons/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     await Coupon.findByIdAndDelete(id);
//     res.status(200).json({ success: true, message: "Coupon deleted" });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// });
