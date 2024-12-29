import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";

const DATABASE_URL = "mongodb://localhost:27017/ecommerce_db"; 

const cleanupDatabase = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Database connected.");

    
    await Coupon.collection.dropIndex("code_1").catch(() => {
      console.log("Index 'code_1' not found; skipping...");
    });

    
    await Coupon.createIndexes({ giftCode: 1 }, { unique: true });

   
    await Coupon.deleteMany({ giftCode: null });

    console.log("Database cleanup complete.");
  } catch (err) {
    console.error("Error during cleanup:", err);
  } finally {
    mongoose.connection.close();
  }
};

cleanupDatabase();
