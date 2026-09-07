import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AddProduct.css";

const AddProduct = () => {
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

    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category
    ) {
      setError(
        "Name, description, price and category are required"
      );
      return;
    }

    if (Number(formData.price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    if (
      formData.stock !== "" &&
      Number(formData.stock) < 0
    ) {
      setError("Stock cannot be negative");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/products", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        image: formData.image.trim(),
        stock:
          formData.stock === ""
            ? 0
            : Number(formData.stock),
      });

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
        navigate("/admin/products");
      }, 1000);

    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("Only admin can add products");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">

      <div className="add-product-card">

        <div className="add-product-header">

          <div>
            <h1>Add Product</h1>
            <p>
              Add a new product to your store
            </p>
          </div>

          <button
            type="button"
            className="back-btn"
            onClick={() =>
              navigate("/admin/products")
            }
          >
            ← Back
          </button>

        </div>

        {error && (
          <div className="add-product-error">
            {error}
          </div>
        )}

        {success && (
          <div className="add-product-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Product Name */}

          <div className="form-group">
            <label>Product Name *</label>

            <input
              type="text"
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Description */}

          <div className="form-group">
            <label>Description *</label>

            <textarea
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {/* Price + Stock */}

          <div className="form-row">

            <div className="form-group">
              <label>Price *</label>

              <input
                type="number"
                name="price"
                placeholder="₹ Enter price"
                value={formData.price}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Stock</label>

              <input
                type="number"
                name="stock"
                placeholder="Enter stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
              />
            </div>

          </div>

          {/* Category */}

          <div className="form-group">
            <label>Category *</label>

            <input
              type="text"
              name="category"
              placeholder="Example: Electronics"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          {/* Image */}

          <div className="form-group">
            <label>Product Image URL</label>

            <input
              type="text"
              name="image"
              placeholder="Enter image URL"
              value={formData.image}
              onChange={handleChange}
            />

            <small>
              Paste an image URL for the product.
            </small>
          </div>

          {/* Buttons */}

          <div className="add-product-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate("/admin/products")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-product-btn"
              disabled={loading}
            >
              {loading
                ? "Adding Product..."
                : "Add Product"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddProduct;