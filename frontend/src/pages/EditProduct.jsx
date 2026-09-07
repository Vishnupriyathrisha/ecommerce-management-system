import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./EditProduct.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get product details
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/products/${id}`);

      const product = response.data.product;

      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        image: product.image || "",
        stock: product.stock ?? "",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

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
      setSaving(true);

      const response = await api.put(
        `/products/${id}`,
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          category: formData.category.trim(),
          image: formData.image.trim(),
          stock:
            formData.stock === ""
              ? 0
              : Number(formData.stock),
        }
      );

      setSuccess(
        response.data.message ||
          "Product updated successfully"
      );

      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("Only admin can update products");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-product-message">
        Loading product...
      </div>
    );
  }

  return (
    <div className="edit-product-page">

      <div className="edit-product-card">

        {/* Header */}

        <div className="edit-product-header">

          <div>
            <h1>Edit Product</h1>
            <p>
              Update your product information
            </p>
          </div>

          <button
            type="button"
            className="edit-back-btn"
            onClick={() =>
              navigate("/admin/products")
            }
          >
            ← Back
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="edit-product-error">
            {error}
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="edit-product-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Name */}

          <div className="edit-form-group">
            <label>Product Name *</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}

          <div className="edit-form-group">
            <label>Description *</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="4"
            />
          </div>

          {/* Price & Stock */}

          <div className="edit-form-row">

            <div className="edit-form-group">
              <label>Price *</label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="edit-form-group">
              <label>Stock</label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
              />
            </div>

          </div>

          {/* Category */}

          <div className="edit-form-group">
            <label>Category *</label>

            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Example: Electronics"
            />
          </div>

          {/* Image */}

          <div className="edit-form-group">
            <label>Product Image URL</label>

            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Enter image URL"
            />

            <small>
              Paste the product image URL here.
            </small>
          </div>

          {/* Current Image Preview */}

          {formData.image && (
            <div className="edit-image-preview">

              <label>Image Preview</label>

              <img
                src={formData.image}
                alt={formData.name}
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />

            </div>
          )}

          {/* Buttons */}

          <div className="edit-product-actions">

            <button
              type="button"
              className="edit-cancel-btn"
              onClick={() =>
                navigate("/admin/products")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="update-product-btn"
              disabled={saving}
            >
              {saving
                ? "Updating..."
                : "Update Product"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditProduct;