import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminProducts.css";

const AdminProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(response.data.products || []);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await api.delete(
        `/products/${id}`
      );

      alert(response.data.message);

      fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-products-message">
        Loading products...
      </div>
    );
  }

  return (
    <div className="admin-products-page">

      <div className="admin-products-header">
        <div>
          <h1>Product Management</h1>
          <p>Manage your store products</p>
        </div>

        <button
          className="add-product-btn"
          onClick={() =>
            navigate("/admin/products/add")
          }
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="admin-products-error">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="no-products">
          <div>🛍️</div>
          <h2>No Products Found</h2>
          <p>Add your first product.</p>
        </div>
      ) : (
        <div className="admin-products-grid">

          {products.map((product) => (

            <div
              className="admin-product-card"
              key={product._id}
            >

              <div className="admin-product-image">

                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                  />
                ) : (
                  <span>🛍️</span>
                )}

              </div>

              <div className="admin-product-info">

                <span className="product-category">
                  {product.category}
                </span>

                <h3>{product.name}</h3>

                <p>
                  {product.description}
                </p>

                <div className="product-price-stock">

                  <strong>
                    ₹{product.price}
                  </strong>

                  <span
                    className={
                      product.stock <= 5
                        ? "low-stock"
                        : "stock"
                    }
                  >
                    Stock: {product.stock}
                  </span>

                </div>

                <div className="product-actions">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      navigate(
                        `/admin/products/edit/${product._id}`
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteProduct(product._id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default AdminProducts;