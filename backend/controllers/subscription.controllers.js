import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export const subscribeUser = async (req, res) => {
  const { planCode } = req.params;
  const { amount } = req.body;

  const userId = req.user._id;

  try {
    const amountInKobo = amount * 100;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: userId.email,
        amount: amountInKobo,
        metadata: {
          userId,
          planCode,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { authorization_url, reference } = response.data.data;

    // Send the payment link to the client
    res.status(200).json({
      success: true,
      message: "Payment link generated successfully",
      paymentUrl: authorization_url,
      reference,
    });
  } catch (error) {
    console.error("Error initializing subscription payment:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initialize payment" });
  }
};

export const verifyPaymentAndSubscribeUser = async (req, res) => {
    const { reference }  = req.params;
  
    try {
      // Verify the payment
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );
  
      const paymentData = response.data.data;
  
      if (paymentData.status === "success") {
        const { metadata, customer } = paymentData;
  
        // Subscribe user to the plan
        const subscriptionResponse = await axios.post(
          "https://api.paystack.co/subscription",
          {
            customer: customer.email,
            plan: metadata.planCode,
          },
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
          }
        );

        // Update user's subscription status in the database
        await User.findByIdAndUpdate(metadata.userId, {
          subscription: metadata.planCode,
          subscriptionStatus: "active",
        });
  
        res.status(200).json({
          success: true,
          message: "Subscription successful",
          data: subscriptionResponse.data,
        });
      } else {
        res.status(400).json({ error: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error verifying payment or subscribing user:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to verify payment or subscribe user" });
    }
  };


