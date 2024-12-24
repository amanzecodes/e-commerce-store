import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                requires: true,
                min: 0
            }
        }
    ],
    totalAmount : {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: 
    { type: String, 
      default: "Pending" 
    },
    isReturned: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;