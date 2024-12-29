import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true, 
    },
    giftCode: { 
      type: String,
      trim: true,
      unique: true, 
      required: true,
    },
    discount: { 
      type: Number,
      required: true,
      default: 10, 
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

couponSchema.index({ giftCode: 1 }, { unique: true })

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
