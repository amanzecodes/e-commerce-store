import Product from '../models/product.model.js'
import Order from "../models/order.model.js";
import Paystack from "paystack-api";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import { default as axios } from "axios";
import crypto from "crypto";

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const paystack = Paystack(PAYSTACK_SECRET_KEY);

export const createSubaccount = async (req, res) => {
  try {
    const { accountNumber, bankName, currency, name } = req.body;

    if (!accountNumber || !bankName) {
      res.status(400).json({ message: "Please fill in the require field" });
    }

    const response = await paystack.subaccount.create({
      business_name: name,
      email: req.user.email,
      percentage_charge: 10,
      currency: currency || "NGN",
      settlement_bank: bankName,
      account_number: accountNumber,
    });

    req.user.subAccountId = response.data.id;
    await req.user.save();

    res.status(201).json(response.data);
  } catch (error) {
    console.error("Error creating sub-account:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



export const initiatePayment = async (req, res) => {
  try {
    const user = await User.findById(req.user._id ).populate({
      path: "cartItems.product",
    });
   
    if (!user || !user.cartItems || user.cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty or user not found" });
    }

    const products = await Product.find({
      _id: { $in: user.cartItems.map((cartItem) => cartItem.product) },
    });
    


const cartWithDetails = user.cartItems.map((cartItem) => {
    const product = products.find(
      (prod) => prod._id.toString() === cartItem.product._id.toString()
    );
    if (!product) {
      console.warn("Product not found for cartItem:", cartItem);
      return null;
    }

    return {
      product,
      quantity: cartItem.quantity,
    };
  })
  .filter((item) => item !== null);

console.log(cartWithDetails)
if (cartWithDetails.length === 0) {
  console.warn("No valid cart items found");
}
console.log("Cart with Details:", cartWithDetails);

    // Group items by sellers and calculate total amounts
    const sellerPayments = {};
    let totalAmount = 0;

    cartWithDetails.forEach(({ product, quantity }) => {
      const sellerId = product.userId;
      if (!sellerId) {
        console.warn("Seller ID not found for product:", product);
        return;
      }

      const itemPrice = product.price * quantity;

      if (!sellerPayments[sellerId]) {
        sellerPayments[sellerId] = { amount: 0, products: [] };
      }

      sellerPayments[sellerId].amount += itemPrice;
      sellerPayments[sellerId].products.push({
        name: product.name,
        quantity,
        price: product.price,
      });

      totalAmount += itemPrice;
    });

    // Initialize payments for each seller's subaccount
    const paymentPromises = Object.keys(sellerPayments).map(async sellerId => {
      const seller = await User.findById(sellerId).select("subAccountId");
      if (!seller || !seller.subAccountId) {
        throw new Error(`Seller with ID ${sellerId} does not have a valid subaccount.`);
      }

      return await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: user.email,
          amount: sellerPayments[sellerId].amount * 100, // Convert to kobo
          callback_url: `${process.env.CLIENT_URL}/payment/verify`,
          metadata: {
            sellerPayments,
          },
          subaccount: seller.subAccountId,
          transaction_charge: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
    });

    const paymentResponses = await Promise.all(paymentPromises);

    res.status(200).json({
      message: "Payment initialized successfully",
      data: paymentResponses.map(response => response.data),
    });
  } catch (error) {
    console.error("Error initializing payment:", error.message);
    res.status(500).json({ message: "Failed to initialize payment", error: error.message });
  }
}



export const verifyPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, data } = response.data;

    if (status && data.status === "success") {
      const order = await Order.findOneAndUpdate(
        { _id: data.metadata.orderId },
        { paymentStatus: "Successful", totalAmount: data.amount / 100 },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.status(200).json({
        message: "Payment verified successfully",
        order,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Payment verification failed", data });
    }
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const webHook = async (req, res) => {
  try {
    //Verifying the webhook signature from Paystack
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json({ message: "Unauthorized webhook request" });
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const { reference, metadata, amount, status } = event.data;

      const orderId = metadata?.orderId;
      if (!orderId) {
        console.error("Order ID missing in metadata");
        return res
          .status(400)
          .json({ message: "Order ID missing in metadata" });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: status === "success" ? "Successful" : "Failed",
          totalAmount: amount / 100,
        },
        { new: true }
      );

      if (!updatedOrder) {
        console.error("Order not found");
        return res.status(404).json({ message: "Order not found" });
      }

      console.log("Order updated successfully:", updatedOrder);

      return res
        .status(200)
        .json({ message: "Webhook processed successfully" });
    }
    console.log("Unhandled event:", event.event);
    return res.status(200).send("Event received");
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};
