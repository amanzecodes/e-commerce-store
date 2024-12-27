import Product from "../models/product.model.js";
import Review from "../models/review.model.js";

export const getReview = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ productId }).populate("user", "name");

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this product." });
    }

    res.status(200).json({
      response: reviews.map((review) => ({
        ...review.toObject(),
      })),
    });
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const existingReview = await Review.findOne({
      productId: productId,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }
    const review = new Review({
      productId,
      user: userId,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({ message: "Review created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error });
  }
};

export const editReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { rating, comment },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
  }
};

export const averageReview = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: "$productId", averageRating: { $avg: "$rating" } } },
    ]);

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this product" });
    }

    res.status(200).json({
      message: "Average rating fetched successfully",
      averageRating: reviews[0].averageRating.toFixed(1),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error calculating average rating",
      error: error.message,
    });
  }
};