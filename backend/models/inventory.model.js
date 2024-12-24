import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  category: { type: String },
  image: { type: String }, // URL or path to image
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
