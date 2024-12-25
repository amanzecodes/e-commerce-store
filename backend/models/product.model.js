import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    category: {
      type: String,
      enum: ["shoes", "corporate wears", "sports", "accessories", "tech"],
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["in stock", "out of stock"],
      default: "in stock",
    },
  },
  { timestamps: true }
);

// Create the Product model
const Product = mongoose.model("Product", productSchema);

export default Product;
