import { useEffect, useState } from "react";
import api from "../services/api";
import "./SellerOrders.css";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders/seller/orders");

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Seller Orders Error:", error);
      setError(
        error.response?.data?.message || "Failed to fetch seller orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, orderStatus) => {
    try {
      await api.put(`/orders/seller/${orderId}/status`, {
        orderStatus,
      });

      fetchOrders();
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  };

  if (loading) {
    return <div className="seller-orders-loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="seller-orders-error">{error}</div>;
  }

  return (
    <div className="seller-orders-page">
      <div className="seller-orders-header">
        <div>
          <h1>My Orders</h1>
          <p>Orders received for your products</p>
        </div>

        <div className="seller-order-count">
          {orders.length} Orders
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-seller-orders">
          <div className="no-orders-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>You don't have any orders for your products.</p>
        </div>
      ) : (
        <div className="seller-orders-list">
          {orders.map((order) => (
            <div className="seller-order-card" key={order._id}>
              <div className="seller-order-top">
                <div>
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <span
                  className={`seller-status ${order.orderStatus
                    .toLowerCase()
                    .replaceAll("_", "-")}`}
                >
                  {order.orderStatus.replaceAll("_", " ")}
                </span>
              </div>

              <div className="seller-customer">
                <h4>Customer</h4>
                <p>{order.user?.name || "Unknown Customer"}</p>
                <span>{order.user?.email || ""}</span>
              </div>

              <div className="seller-order-items">
                <h4>Products</h4>

                {order.items
                  .filter(
                    (item) =>
                      item.seller?.toString() ===
                      JSON.parse(localStorage.getItem("user"))?._id?.toString()
                  )
                  .map((item, index) => (
                    <div className="seller-order-item" key={index}>
                      <div className="seller-product-info">
                        {item.product?.image && (
                          <img
                            src={item.product.image}
                            alt={item.name}
                          />
                        )}

                        <div>
                          <strong>{item.name}</strong>
                          <p>
                            ₹{item.price} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      <strong>₹{item.subtotal}</strong>
                    </div>
                  ))}
              </div>

              <div className="seller-order-bottom">
                <div>
                  <span>Total Order Amount</span>
                  <strong>₹{order.totalAmount}</strong>
                </div>

                {order.orderStatus !== "DELIVERED" &&
                  order.orderStatus !== "CANCELLED" && (
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        updateStatus(order._id, e.target.value)
                      }
                    >
                      <option value="PLACED">Placed</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="OUT_FOR_DELIVERY">
                        Out for Delivery
                      </option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;