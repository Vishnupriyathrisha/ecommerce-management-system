import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./SellerAddProduct.css";

const SellerAddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/products/seller",
        {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          image: formData.image,
          stock: Number(formData.stock),
        }
      );

      setSuccess(
        response.data.message ||
          "Product added successfully"
      );

      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        stock: "",
      });

      setTimeout(() => {
        navigate("/seller/products");
      }, 1000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-add-product">

      <div className="seller-add-header">
        <div>
          <h1>Add Product</h1>
          <p>Add a new product to your store</p>
        </div>

        <button
          className="seller-back-btn"
          onClick={() => navigate("/seller/products")}
        >
          ← My Products
        </button>
      </div>

      {error && (
        <div className="seller-form-error">
          {error}
        </div>
      )}

      {success && (
        <div className="seller-form-success">
          {success}
        </div>
      )}

      <form
        className="seller-product-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">
          <label>Product Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows="5"
            required
          />
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>Price</label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="₹ Price"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Stock</label>

            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Stock quantity"
              min="0"
              required
            />
          </div>

        </div>

        <div className="form-group">
          <label>Category</label>

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Example: Electronics"
            required
          />
        </div>

        <div className="form-group">
          <label>Product Image URL</label>

          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Enter image URL"
          />
        </div>

        <div className="seller-form-actions">

          <button
            type="button"
            className="seller-cancel-btn"
            onClick={() =>
              navigate("/seller/products")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="seller-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Adding Product..."
              : "Add Product"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default SellerAddProduct;