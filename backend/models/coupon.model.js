import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true, // Ensures every coupon is tied to a product
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensures coupon codes are unique
    },
    discountPercentage: {
      type: Number,
      required: true,
      default: 10, // Default discount percentage
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
      },
    ],
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
