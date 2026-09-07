import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/orders/${id}`);

      setOrder(response.data.order);
    } catch (error) {
      console.error("Order Details Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      const response = await api.put(
        `/orders/${id}/cancel`
      );

      alert(response.data.message);

      fetchOrderDetails();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to cancel order"
      );
    }
  };

  if (loading) {
    return (
      <div className="order-details-message">
        Loading order details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-message error">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-message">
        Order not found
      </div>
    );
  }

  return (
    <div className="order-details-page">

      {/* Header */}

      <div className="order-details-header">

        <div>
          <Link to="/orders" className="back-orders">
            ← Back to Orders
          </Link>

          <h1>Order Details</h1>

          <p>
            Order #
            {order._id.slice(-8).toUpperCase()}
          </p>
        </div>

        <span
          className={`details-status ${order.orderStatus?.toLowerCase()}`}
        >
          {order.orderStatus}
        </span>

      </div>

      {/* Order Information */}

      <div className="order-info-grid">

        <div className="info-box">
          <span>Order Date</span>

          <strong>
            {new Date(
              order.createdAt
            ).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>

        <div className="info-box">
          <span>Payment Method</span>

          <strong>
            {order.paymentMethod}
          </strong>
        </div>

        <div className="info-box">
          <span>Payment Status</span>

          <strong>
            {order.paymentStatus}
          </strong>
        </div>

        <div className="info-box">
          <span>Total Amount</span>

          <strong>
            ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
          </strong>
        </div>

      </div>

      {/* Shipping Address */}

      <div className="details-section">

        <h2>📍 Shipping Address</h2>

        <div className="shipping-address">
          {order.shippingAddress}
        </div>

      </div>

      {/* Products */}

      <div className="details-section">

        <h2>🛍️ Ordered Products</h2>

        <div className="details-products">

          {order.items?.map((item, index) => (

            <div
              className="details-product"
              key={item.product?._id || index}
            >

              <div className="details-product-image">

                {item.product?.image ? (
                  <img
                    src={item.product.image}
                    alt={item.name}
                  />
                ) : (
                  <span>🛍️</span>
                )}

              </div>

              <div className="details-product-info">

                <h3>{item.name}</h3>

                <p>
                  ₹{item.price} × {item.quantity}
                </p>

                <span>
                  Quantity: {item.quantity}
                </span>

              </div>

              <strong className="details-product-total">
                ₹{Number(item.subtotal || 0).toLocaleString("en-IN")}
              </strong>

            </div>

          ))}

        </div>

      </div>

      {/* Price Summary */}

      <div className="details-section">

        <h2>💰 Price Summary</h2>

        <div className="price-summary">

          <div>
            <span>Subtotal</span>
            <strong>
              ₹{Number(order.subtotal || 0).toLocaleString("en-IN")}
            </strong>
          </div>

          {order.discount > 0 && (
            <div className="discount-row">
              <span>
                Discount
                {order.couponCode
                  ? ` (${order.couponCode})`
                  : ""}
              </span>

              <strong>
                -₹{Number(order.discount).toLocaleString("en-IN")}
              </strong>
            </div>
          )}

          <div className="total-row">
            <span>Total</span>

            <strong>
              ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

      </div>

      {/* Actions */}

      {["PLACED", "CONFIRMED"].includes(
        order.orderStatus
      ) && (

        <div className="order-actions">

          <button
            className="details-cancel-btn"
            onClick={cancelOrder}
          >
            Cancel Order
          </button>

        </div>

      )}

    </div>
  );
};

export default OrderDetails;