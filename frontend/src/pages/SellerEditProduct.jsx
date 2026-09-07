import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./SellerEditProduct.css";

const SellerEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

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
        isActive: product.isActive ?? true,
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch product"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.put(`/products/seller/${id}`, {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });

      alert("Product updated successfully");

      navigate("/seller/products");
    } catch (error) {
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
      <div className="seller-edit-loading">
        Loading product...
      </div>
    );
  }

  return (
    <div className="seller-edit-product">

      <div className="seller-edit-header">
        <div>
          <h1>Edit Product</h1>
          <p>Update your product details</p>
        </div>

        <button
          type="button"
          className="seller-back-btn"
          onClick={() => navigate("/seller/products")}
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="seller-edit-error">
          {error}
        </div>
      )}

      <form
        className="seller-edit-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
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
            required
          />
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
          />
        </div>

        <div className="seller-active-row">

          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />

          <label>Product Active</label>

        </div>

        <div className="seller-edit-buttons">

          <button
            type="button"
            className="seller-cancel-btn"
            onClick={() => navigate("/seller/products")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="seller-save-btn"
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Product"}
          </button>

        </div>

      </form>
    </div>
  );
};

export default SellerEditProduct;