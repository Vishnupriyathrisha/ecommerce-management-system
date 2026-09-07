const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add product to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const qty = Number(quantity);

    if (qty < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [
          {
            product: productId,
            quantity: qty,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + qty;

        if (newQuantity > product.stock) {
          return res.status(400).json({
            message: "Requested quantity exceeds available stock",
          });
        }

        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({
          product: productId,
          quantity: qty,
        });
      }

      await cart.save();
    }

    const updatedCart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    res.status(200).json({
      message: "Product added to cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product to cart",
      error: error.message,
    });
  }
};

// Get my cart
const getMyCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        cart: {
          items: [],
        },
      });
    }

    res.status(200).json({
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const qty = Number(quantity);

    if (qty < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
      });
    }

    item.quantity = qty;

    await cart.save();

    const updatedCart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    res.status(200).json({
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update cart",
      error: error.message,
    });
  }
};

// Remove product from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    res.status(200).json({
      message: "Product removed from cart",
      cart: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove product from cart",
      error: error.message,
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(200).json({
        message: "Cart is already empty",
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getMyCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};