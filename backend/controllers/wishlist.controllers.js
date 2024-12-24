import Product from '../models/product.model.js';
import Wishlist from '../models/wishlist.model.js';
export const addToWishlist = async (req, res) => {
        const { productId } = req.params;
        const  userId  = req.user._id;
      
        try {
          const product = await Product.findById(productId);
          if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
          }
      
    
          let wishlist = await Wishlist.findOne({ userId });
          if (!wishlist) {
            wishlist = new Wishlist({ userId, items: [{ productId }] });
          } else {
            const itemExists = wishlist.items.some(item => item.productId.toString() === productId);
            if (itemExists) {
              return res.status(400).json({ success: false, message: 'Product already in wishlist' });
            }
      
            // Add the product to the wishlist
            wishlist.items.push({ productId });
          }
      
          await wishlist.save();
      
          res.status(200).json({ success: true, message: 'Product added to wishlist', data: wishlist });
        } catch (error) {
          console.error('Error adding product to wishlist:', error.message);
          res.status(500).json({ success: false, message: 'Internal server error' });
        }
      }


export const viewWishlist = async (req, res) => {
  try {
    const userId  = req.user._id;
    if(!userId){
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    const wishlist = await Wishlist.findOne({ userId }).populate('items.productId', 'name price');
    
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  try {
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    const itemIndex = wishlist.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }

    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Product removed from wishlist', data: wishlist });
  } catch (error) {
    console.error('Error removing product from wishlist:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}