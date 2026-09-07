const express = require("express");

const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getMyProducts,
  updateMyProduct,
  deleteMyProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =================================
// PUBLIC ROUTES
// =================================

// Get all active products
router.get("/", getAllProducts);


// =================================
// SELLER ROUTES
// =================================

// Seller - Add product
router.post(
  "/seller",
  authMiddleware,
  roleMiddleware("seller"),
  addProduct
);

// Seller - Get own products
router.get(
  "/seller/my-products",
  authMiddleware,
  roleMiddleware("seller"),
  getMyProducts
);

// Seller - Update own product
router.put(
  "/seller/:id",
  authMiddleware,
  roleMiddleware("seller"),
  updateMyProduct
);

// Seller - Delete own product
router.delete(
  "/seller/:id",
  authMiddleware,
  roleMiddleware("seller"),
  deleteMyProduct
);


// =================================
// ADMIN - SELLER PRODUCTS
// =================================

// Admin - Get products of a specific seller
router.get(
  "/admin/seller/:sellerId",
  authMiddleware,
  roleMiddleware("admin"),
  getSellerProducts
);


// =================================
// ADMIN PRODUCT ROUTES
// =================================

// Admin - Add product
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  addProduct
);

// Admin - Update any product
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateProduct
);

// Admin - Delete any product
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteProduct
);


// =================================
// SINGLE PRODUCT
// =================================

// Get single product
router.get("/:id", getProductById);


module.exports = router;