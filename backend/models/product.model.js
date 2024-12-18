import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    image: {
        type: String,
        required: [true, 'Image is required']
    },
    category: {
        type: String,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    userId: { // Reference to the User model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Ensure this matches your User model name
        required: true // Make it required if every product must have an owner
    }
}, { timestamps: true });

// Create the Product model
const Product = mongoose.model("Product", productSchema);

export default Product;
