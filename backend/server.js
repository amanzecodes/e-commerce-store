import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import settingsRoute from "./routes/settings.route.js"
import clientsRoute from './routes/client.route.js'
import faqRoute from './routes/faq.route.js'
import inventoryRoute from "./routes/inventory.route.js";
import wishlistRoute from "./routes/wishlist.route.js";
import couponRoute from './routes/coupon.route.js'
const app = express();
app.use(cors())
dotenv.config();


const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/analytics", analyticsRoute);
app.use("/api/settings", settingsRoute);
app.use("/api/inventory", inventoryRoute);;
app.use('/api/clients', clientsRoute);
app.use('/api/faq-section', faqRoute)
app.use('/api/payment', paymentRoutes)
app.use('/api/wishlist', wishlistRoute)
app.use('/api/coupon', couponRoute)

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
