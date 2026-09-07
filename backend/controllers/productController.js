const Product = require("../models/Product");
const Notification = require("../models/Notification");
const User = require("../models/User");

const LOW_STOCK_LIMIT = 5;

// Add Product - Admin / Seller
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock,
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        message: "Name, description, price and category are required",
      });
    }

    // Product data
    const productData = {
      name,
      description,
      price,
      category,
      image,
      stock,
    };

    // If seller is adding product,
    // save seller ID with the product
    if (req.user.role === "seller") {
      productData.seller = req.user.id;
    }

    const product = await Product.create(productData);

    // New Product Notification to Buyers
const buyers = await User.find({
  role: "user",
}).select("_id");

if (buyers.length > 0) {
  const notifications = buyers.map((buyer) => ({
    recipient: buyer._id,
    title: "New Product Available",
    message: `${product.name} is now available in our store.`,
    type: "GENERAL",
    relatedProduct: product._id,
  }));

  await Notification.insertMany(notifications);
}
    // Low stock notification
    if (stock !== undefined && Number(stock) <= LOW_STOCK_LIMIT) {
      const admins = await User.find({
        role: "admin",
      }).select("_id");

      if (admins.length > 0) {
        const notifications = admins.map((admin) => ({
          recipient: admin._id,
          title: "Low Stock Alert",
          message: `${product.name} has only ${product.stock} items left in stock.`,
          type: "LOW_STOCK",
          relatedProduct: product._id,
        }));

        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;

    const filter = {
      isActive: true,
    };

    // Search by product name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Category filter
    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get Single Product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// Update Product - Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // Low stock notification
    if (
      updatedProduct.stock <= LOW_STOCK_LIMIT &&
      product.stock > LOW_STOCK_LIMIT
    ) {
      const admins = await User.find({
        role: "admin",
      }).select("_id");

      if (admins.length > 0) {
        const notifications = admins.map((admin) => ({
          recipient: admin._id,
          title: "Low Stock Alert",
          message: `${updatedProduct.name} has only ${updatedProduct.stock} items left in stock.`,
          type: "LOW_STOCK",
          relatedProduct: updatedProduct._id,
        }));

        await Notification.insertMany(notifications);
      }
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete Product - Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// =================================
// GET PRODUCTS BY SELLER - ADMIN
// =================================
const getSellerProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findOne({
      _id: sellerId,
      role: "seller",
    }).select("-password");

    if (!seller) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    const products = await Product.find({
      seller: sellerId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Seller products fetched successfully",
      seller,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch seller products",
      error: error.message,
    });
  }
};


// =================================
// GET OWN PRODUCTS - SELLER
// =================================
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Seller products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch seller products",
      error: error.message,
    });
  }
};


// =================================
// UPDATE OWN PRODUCT - SELLER
// =================================
const updateMyProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or you are not the owner",
      });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        seller: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};


// =================================
// DELETE OWN PRODUCT - SELLER
// =================================
const deleteMyProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or you are not the owner",
      });
    }

    await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.id,
    });

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerProducts,

  // Seller
  getMyProducts,
  updateMyProduct,
  deleteMyProduct,
};