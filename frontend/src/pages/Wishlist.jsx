import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch Wishlist
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/wishlist");

      setWishlist(
        response.data.wishlist?.products || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load wishlist"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Remove from Wishlist
  const handleRemove = async (productId) => {
    try {
      const response = await api.delete(
        `/wishlist/${productId}`
      );

      setWishlist((prev) =>
        prev.filter(
          (product) => product._id !== productId
        )
      );

      alert(response.data.message);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to remove product"
      );
    }
  };

  // Move to Cart
  const handleMoveToCart = async (productId) => {
    try {
      const response = await api.post(
        `/wishlist/${productId}/move-to-cart`
      );

      setWishlist((prev) =>
        prev.filter(
          (product) => product._id !== productId
        )
      );

      alert(response.data.message);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to move product to cart"
      );
    }
  };

  if (loading) {
    return (
      <div className="wishlist-message">
        Loading wishlist...
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-message error">
        {error}
      </div>
    );
  }

  return (
    <div className="wishlist-page">

      <div className="wishlist-header">
        <h1>❤️ My Wishlist</h1>

        <button
          className="continue-shopping-btn"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-icon">💔</div>

          <h2>Your Wishlist is Empty</h2>

          <p>
            Save your favorite products here and
            come back later.
          </p>

          <button
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">

          {wishlist.map((product) => (
            <div
              className="wishlist-card"
              key={product._id}
            >

              {/* Product Image */}
              <div className="wishlist-image">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                  />
                ) : (
                  <span>🛍️</span>
                )}
              </div>

              {/* Product Details */}
              <div className="wishlist-info">

                <span className="wishlist-category">
                  {product.category}
                </span>

                <h2>{product.name}</h2>

                <p className="wishlist-description">
                  {product.description}
                </p>

                <div className="wishlist-price">
                  ₹{product.price}
                </div>

                <div
                  className={`wishlist-stock ${
                    product.stock > 0
                      ? "in-stock"
                      : "out-stock"
                  }`}
                >
                  {product.stock > 0
                    ? `✓ ${product.stock} items available`
                    : "✕ Out of Stock"}
                </div>

                {/* Actions */}
                <div className="wishlist-actions">

                  {product.stock > 0 && (
                    <button
                      className="move-cart-btn"
                      onClick={() =>
                        handleMoveToCart(
                          product._id
                        )
                      }
                    >
                      🛒 Move to Cart
                    </button>
                  )}

                  <button
                    className="remove-wishlist-btn"
                    onClick={() =>
                      handleRemove(product._id)
                    }
                  >
                    🗑️ Remove
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

export default Wishlist;