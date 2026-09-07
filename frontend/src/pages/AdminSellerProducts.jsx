import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminSellerProducts.css";

const AdminSellerProducts = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSellerProducts();
  }, [sellerId]);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      setError("");

     const response = await api.get(
  `/products/admin/seller/${sellerId}`
);

      setSeller(response.data.seller);
      setProducts(response.data.products || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load seller products"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-seller-products-loading">
        Loading seller products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-seller-products-error">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-seller-products">

      {/* Header */}

      <div className="seller-products-header">

        <div>
          <h1>
            {seller?.name || "Seller"} Products
          </h1>

          <p>
            {seller?.email || ""}
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/admin/sellers")}
        >
          ← Back to Sellers
        </button>

      </div>


      {/* Seller Information */}

      {seller && (
        <div className="seller-info-card">

          <div className="seller-avatar">
            {seller.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{seller.name}</h3>
            <p>{seller.email}</p>

            <span
              className={`seller-status ${
                seller.isBlocked
                  ? "blocked"
                  : "active"
              }`}
            >
              {seller.isBlocked
                ? "Blocked"
                : "Active"}
            </span>
          </div>

        </div>
      )}


      {/* Products */}

      <div className="products-section">

        <div className="products-section-header">
          <h2>Products</h2>

          <span>
            {products.length} product
            {products.length !== 1 ? "s" : ""}
          </span>
        </div>


        {products.length === 0 ? (
          <div className="empty-products">
            <div className="empty-icon">
              🛍️
            </div>

            <h3>No Products Found</h3>

            <p>
              This seller has not added any products yet.
            </p>
          </div>
        ) : (
          <div className="seller-products-grid">

            {products.map((product) => (
              <div
                className="seller-product-card"
                key={product._id}
              >

                {/* Image */}

                <div className="product-image">

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  ) : (
                    <div className="no-image">
                      🛍️
                    </div>
                  )}

                </div>


                {/* Details */}

                <div className="product-details">

                  <h3>{product.name}</h3>

                  <p className="product-category">
                    {product.category}
                  </p>

                  <p className="product-description">
                    {product.description}
                  </p>

                  <div className="product-info">

                    <strong>
                      ₹{product.price}
                    </strong>

                    <span
                      className={
                        product.stock <= 5
                          ? "low-stock"
                          : "in-stock"
                      }
                    >
                      Stock: {product.stock}
                    </span>

                  </div>

                  <div className="product-status">

                    {product.isActive ? (
                      <span className="active-status">
                        Active
                      </span>
                    ) : (
                      <span className="inactive-status">
                        Inactive
                      </span>
                    )}

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default AdminSellerProducts;