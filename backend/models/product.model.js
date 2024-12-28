import mongoose from "mongoose";
import { io } from '../lib/socket.js'
import Notification from "../models/notifications.model.js";

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

productSchema.post("save", async function (doc) {
  const LOW_STOCK_THRESHOLD = 10;

  if (doc.stock <= LOW_STOCK_THRESHOLD) {
    const userId = doc.userId;

    await Notification.create({
      userId: userId,
      type: "LOW-STOCK",
      message: `Product "${doc.name}" is low on stock.`,
      data: { productId: doc._id, stock: doc.stock },
    });

    io.to(userId).emit("notification", {
      type: "LOW-STOCK",
      message: `Product "${doc.name}" is low on stock.`,
    });
  }
});


const Product = mongoose.model("Product", productSchema);
export default Product;
