import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./SellerProducts.css";

const SellerProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  // ===============================
  // GET SELLER OWN PRODUCTS
  // ===============================
  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products/seller/my-products");

      setProducts(response.data.products || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load your products"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE PRODUCT
  // ===============================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await api.delete(`/products/seller/${id}`);

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== id)
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <div className="seller-products-loading">
        Loading your products...
      </div>
    );
  }

  return (
    <div className="seller-products">

      {/* Header */}
      <div className="seller-products-header">
        <div>
          <h1>My Products</h1>
          <p>Manage your products</p>
        </div>

        <div className="seller-products-actions">
          <button
            className="seller-refresh-btn"
            onClick={fetchMyProducts}
          >
            ↻ Refresh
          </button>

          <button
            className="seller-add-btn"
            onClick={() => navigate("/seller/products/add")}
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="seller-products-error">
          {error}
        </div>
      )}

      {/* Empty */}
      {products.length === 0 ? (
        <div className="seller-products-empty">
          <div className="empty-icon">🛍️</div>

          <h3>No Products Found</h3>

          <p>
            You haven't added any products yet.
          </p>

          <button
            onClick={() => navigate("/seller/products/add")}
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="seller-products-table-wrapper">

          <table className="seller-products-table">

            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product._id}>

                  {/* Product */}
                  <td>
                    <div className="seller-product-info">

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="seller-product-image"
                        />
                      ) : (
                        <div className="seller-product-placeholder">
                          🛍️
                        </div>
                      )}

                      <div>
                        <h4>{product.name}</h4>

                        <p>
                          {product.description}
                        </p>
                      </div>

                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    {product.category}
                  </td>

                  {/* Price */}
                  <td>
                    ₹{product.price}
                  </td>

                  {/* Stock */}
                  <td>
                    <span
                      className={
                        product.stock <= 5
                          ? "low-stock"
                          : "normal-stock"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`product-status ${
                        product.isActive
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {product.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="seller-product-buttons">

                      <button
                        className="seller-edit-btn"
                        onClick={() =>
                          navigate(
                            `/seller/products/edit/${product._id}`
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="seller-delete-btn"
                        onClick={() =>
                          handleDelete(product._id)
                        }
                        disabled={
                          deletingId === product._id
                        }
                      >
                        {deletingId === product._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default SellerProducts;