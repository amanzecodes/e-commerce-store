import mongoose, { Mongoose } from "mongoose";

const salesItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity: { type: Number, min: 1, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SalesItem = mongoose.model("SalesItem", salesItemSchema);

export default SalesItem;