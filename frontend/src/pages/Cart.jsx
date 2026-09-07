import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState({
    items: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/cart");

      setCart(response.data.cart || { items: [] });

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load cart"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (
    productId,
    quantity
  ) => {
    try {
      const response = await api.put(
        `/cart/${productId}`,
        {
          quantity,
        }
      );

      setCart(response.data.cart);

    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update cart"
      );
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await api.delete(
        `/cart/${productId}`
      );

      setCart(response.data.cart);

    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to remove product"
      );
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart");

      setCart({
        items: [],
      });

    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to clear cart"
      );
    }
  };

  const total = cart.items.reduce(
    (sum, item) =>
      sum +
      item.product.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="cart-message">
        Loading cart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-message error">
        {error}
      </div>
    );
  }

  return (
    <div className="cart-page">

      <div className="cart-header">
        <h1>My Cart 🛒</h1>

        <Link to="/products">
          Continue Shopping
        </Link>
      </div>

      {cart.items.length === 0 ? (
        <div className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>Your cart is empty</h2>

          <p>
            Add some products to your cart.
          </p>

          <Link
            to="/products"
            className="shop-btn"
          >
            Shop Now
          </Link>

        </div>
      ) : (
        <div className="cart-container">

          <div className="cart-items">

            {cart.items.map((item) => (
              <div
                className="cart-item"
                key={item.product._id}
              >

                <div className="cart-image">

                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                    />
                  ) : (
                    <span>🛍️</span>
                  )}

                </div>

                <div className="cart-info">

                  <span className="cart-category">
                    {item.product.category}
                  </span>

                  <h3>
                    {item.product.name}
                  </h3>

                  <p>
                    ₹{item.product.price}
                  </p>

                  <div className="cart-actions">

                    <div className="quantity-control">

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          item.quantity >=
                          item.product.stock
                        }
                      >
                        +
                      </button>

                    </div>

                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeItem(
                          item.product._id
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>

                <div className="item-total">
                  ₹
                  {(
                    item.product.price *
                    item.quantity
                  ).toFixed(2)}
                </div>

              </div>
            ))}

          </div>

          <div className="cart-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>
              <span>
                ₹{total.toFixed(2)}
              </span>
            </div>

            <button
               className="checkout-btn"
               onClick={() => navigate("/checkout")}>
                 Proceed to Checkout
                </button>

            <button
              className="clear-cart-btn"
              onClick={clearCart}
            >
              Clear Cart
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

export default Cart;