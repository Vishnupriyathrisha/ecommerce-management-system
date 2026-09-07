const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      const alreadyExists = wishlist.products.some(
        (id) => id.toString() === productId
      );

      if (alreadyExists) {
        return res.status(400).json({
          message: "Product already exists in wishlist",
        });
      }

      wishlist.products.push(productId);
      await wishlist.save();
    }

    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate("products");

    res.status(200).json({
      message: "Product added to wishlist successfully",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product to wishlist",
      error: error.message,
    });
  }
};

// Get my wishlist
const getMyWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate("products");

    if (!wishlist) {
      return res.status(200).json({
        message: "Wishlist is empty",
        wishlist: {
          products: [],
        },
      });
    }

    res.status(200).json({
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    const productExists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (!productExists) {
      return res.status(404).json({
        message: "Product not found in wishlist",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate("products");

    res.status(200).json({
      message: "Product removed from wishlist successfully",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
};

const moveToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    const productExists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (!productExists) {
      return res.status(404).json({
        message: "Product not found in wishlist",
      });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not available",
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        message: "Product is out of stock",
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [
          {
            product: productId,
            quantity: 1,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        if (existingItem.quantity + 1 > product.stock) {
          return res.status(400).json({
            message: "Not enough stock available",
          });
        }

        existingItem.quantity += 1;
      } else {
        cart.items.push({
          product: productId,
          quantity: 1,
        });
      }

      await cart.save();
    }

    // Remove from wishlist
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.product");

    res.status(200).json({
      message: "Product moved to cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to move product to cart",
      error: error.message,
    });
  }
};
module.exports = {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  moveToCart,
};