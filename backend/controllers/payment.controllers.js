import Product from '../models/product.model.js';
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

    // Validate required fields
    if (!accountNumber || !bankName) {
      return res.status(400).json({ message: "Please fill in the required fields" });
    }

    console.log("Request body:", req.body); // Log the request body

    // Create subaccount via Paystack API
    const response = await paystack.subaccount.create({
      business_name: name,
      email: req.user.email,
      percentage_charge: 0,
      currency: currency || "NGN",
      settlement_bank: bankName,
      account_number: accountNumber,
    });

  

    // Save subaccount code to user
    req.user.subAccountId = response.data.subaccount_code; 
    await req.user.save(); 

    // Return the response
    res.status(201).json(response.data);
  } catch (error) {
    console.error("Error creating sub-account:", error);

    // Handle validation error specifically
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    // General server error
    res.status(500).json({ message: "Server Error" });
  }
};

export const initiatePayment = async (req, res) => {
  try {
    // Retrieve the user and their cart items
    const user = await User.findById(req.user._id).populate({
      path: "cartItems.product",
    });

    if (!user || !user.cartItems.length) {
      return res.status(400).json({ message: "Cart is empty or user not found" });
    }

    // Fetch all products in the user's cart
    const products = await Product.find({
      _id: { $in: user.cartItems.map((cartItem) => cartItem.product) },
    });

    // Prepare the cart with product details
    const cartWithDetails = user.cartItems
      .map((cartItem) => {
        const product = products.find(
          (prod) => prod._id.toString() === cartItem.product._id.toString()
        );
        if (!product) return null;
        return { product, quantity: cartItem.quantity };
      })
      .filter(Boolean);

    if (!cartWithDetails.length) {
      return res.status(400).json({ message: "No valid cart items found" });
    }

    // Calculate total amount and prepare split configuration
    let totalAmount = 0;
    const splitSubaccounts = [];
    const sellerShares = {};

    for (const { product, quantity } of cartWithDetails) {
      const sellerId = product.userId;
      const itemAmount = product.price * quantity;
      totalAmount += itemAmount;

      if (!sellerShares[sellerId]) {
        const seller = await User.findById(sellerId);
        if (seller && seller.subAccountId) {
          sellerShares[sellerId] = {
            subaccount: seller.subAccountId,
            share: 0,
          };
        }
      }

      if (sellerShares[sellerId]) {
        sellerShares[sellerId].share += itemAmount;
      }
    }

    // Add each seller's share to the split configuration
    for (const sellerId in sellerShares) {
      const { subaccount, share } = sellerShares[sellerId];
      splitSubaccounts.push({ subaccount, share: (share / totalAmount) * 100 }); // Convert to percentage
    }

    if (!splitSubaccounts.length) {
      return res.status(400).json({
        message: "At least one seller must have a valid subaccount",
      });
    }

    // Create a new order
    const newOrder = new Order({
      user: user._id,
      products: cartWithDetails.map(({ product, quantity }) => ({
        product: product._id,
        quantity,
      })),
      totalAmount,
      paymentStatus: "Pending",
      stripeSessionId: crypto.randomBytes(16).toString("hex"),
    });

    const createdOrder = await newOrder.save();

    const paystackUrl = "https://api.paystack.co/transaction/initialize";
    const paymentData = {
      email: user.email,
      amount: totalAmount * 100, // Convert to kobo
      callback_url: `${process.env.CLIENT_URL}/payment/verify`,
      metadata: { orderId: createdOrder._id },
      split: {
        type: "percentage",
        bearer_type: "subaccount",
        bearer_subaccount: splitSubaccounts[0].subaccount,
        subaccounts: splitSubaccounts, 
      },
    };

    console.log("Payment Data:", JSON.stringify(paymentData, null, 2));

    // Send payment request to Paystack
    const paymentResponse = await axios.post(paystackUrl, paymentData, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Paystack Response:", paymentResponse.data);

    res.status(200).json({
      message: "Payment initiated successfully",
      authorization_url: paymentResponse.data.data.authorization_url,
      reference: paymentResponse.data.data.reference,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({
      message: "Failed to initiate payment",
      error: error.response?.data || error.message,
    });
  }
};


// Verify Payment
export const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { status, data } = response.data;

    if (status && data.status === "success") {
      const orderId = data.metadata?.orderId;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID missing in metadata" });
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: "Successful" },
        { new: true }
      );

      return res.status(200).json({
        message: "Payment verified successfully and order updated",
        order,
      });
    } else {
      return res.status(400).json({ message: "Payment verification failed", data });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



export const webHook = async (req, res) => {
  try {
    // Verifying the webhook signature from Paystack
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY is not set");
      return res.status(500).json({ message: "Server Error: Configuration missing" });
    }

    const paystackSignature = req.headers["x-paystack-signature"];
    if (!paystackSignature) {
      console.error("x-paystack-signature header is missing");
      return res.status(401).json({ message: "Unauthorized webhook request" });
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== paystackSignature) {
      return res.status(401).json({ message: "Unauthorized webhook request" });
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const { metadata, amount, status } = event.data;

      const orderId = metadata?.orderId;
      if (!orderId) {
        console.error("Order ID missing in metadata");
        return res.status(400).json({ message: "Order ID missing in metadata" });
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

      // Reduce stock quantity for each product in the order
      const orderedProducts = metadata.sellerPayments;
      for (const sellerId in orderedProducts) {
        for (const product of orderedProducts[sellerId].products) {
          await Product.updateOne(
            { _id: product._id },
            { $inc: { stock: -product.quantity } }
          );
        }
      }

      console.log("Order updated successfully:", updatedOrder);

      return res.status(200).json({ message: "Webhook processed successfully" });
    }

    console.log("Unhandled event:", event.event);
    return res.status(200).send("Event received");
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};