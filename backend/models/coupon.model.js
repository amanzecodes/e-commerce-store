import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    code: {
        type: String,
        required: true,
        trim: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        default: 10
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    expiryDate: {
        type: Date,
        required: true
    }
}, { timestamps: true })

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;