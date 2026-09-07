import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminOrders.css";

const AdminOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersResponse, salesResponse] =
        await Promise.all([
          api.get("/admin/orders"),
          api.get("/admin/orders/sales-summary"),
        ]);

      setOrders(ordersResponse.data.orders || []);
      setSales(salesResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("Access denied. Admin only.");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (orderId, orderStatus) => {
    try {
      const response = await api.put(
        `/admin/orders/${orderId}/status`,
        {
          orderStatus,
        }
      );

      alert(response.data.message);

      fetchData();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update order status"
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-orders-message">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders-message error">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-orders-page">

      {/* Header */}

      <div className="admin-orders-header">
        <div>
          <h1>Order Management</h1>
          <p>Manage customer orders and sales</p>
        </div>
      </div>

      {/* Sales Summary */}

      {sales && (
        <div className="sales-cards">

          <div className="sales-card">
            <span>Total Orders</span>
            <strong>{sales.totalOrders}</strong>
          </div>

          <div className="sales-card">
            <span>Total Sales</span>
            <strong>
              ₹{sales.totalSales.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="sales-card">
            <span>Today's Orders</span>
            <strong>{sales.todayOrders}</strong>
          </div>

          <div className="sales-card">
            <span>Today's Sales</span>
            <strong>
              ₹{sales.todaySales.toLocaleString("en-IN")}
            </strong>
          </div>

        </div>
      )}

      {/* Orders */}

      {orders.length === 0 ? (
        <div className="no-orders">
          <div>📦</div>
          <h2>No Orders Found</h2>
          <p>No customer orders available.</p>
        </div>
      ) : (
        <div className="admin-orders-list">

          {orders.map((order) => (

            <div
              className="admin-order-card"
              key={order._id}
            >

              {/* Order Header */}

              <div className="admin-order-top">

                <div>
                  <span>Order ID</span>
                  <h3>
                    #{order._id
                      .slice(-8)
                      .toUpperCase()}
                  </h3>
                </div>

                <span
                  className={`admin-status ${order.orderStatus
                    ?.toLowerCase()
                    .replaceAll("_", "-")}`}
                >
                  {order.orderStatus}
                </span>

              </div>

              {/* Customer */}

              <div className="customer-info">

                <h3>Customer Details</h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {order.user?.name || "N/A"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {order.user?.email || "N/A"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {order.user?.phone || "N/A"}
                </p>

              </div>

              {/* Products */}

              <div className="admin-order-items">

                <h3>Order Items</h3>

                {order.items.map((item) => (

                  <div
                    className="admin-order-item"
                    key={item._id}
                  >

                    <div className="admin-item-image">

                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.name}
                        />
                      ) : (
                        <span>🛍️</span>
                      )}

                    </div>

                    <div className="admin-item-info">

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        ₹{item.price} ×{" "}
                        {item.quantity}
                      </span>

                    </div>

                    <strong>
                      ₹{item.subtotal}
                    </strong>

                  </div>

                ))}

              </div>

              {/* Order Details */}

              <div className="admin-order-details">

                <div>
                  <span>Payment</span>
                  <strong>
                    {order.paymentMethod}
                  </strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <strong>
                    {order.paymentStatus}
                  </strong>
                </div>

                <div>
                  <span>Subtotal</span>
                  <strong>
                    ₹{order.subtotal}
                  </strong>
                </div>

                <div>
                  <span>Discount</span>
                  <strong>
                    - ₹{order.discount || 0}
                  </strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong className="admin-total">
                    ₹{order.totalAmount}
                  </strong>
                </div>

              </div>

              {/* Shipping Address */}

              <div className="shipping-info">

                <h3>Shipping Address</h3>

                <p>
                  {order.shippingAddress}
                </p>

              </div>

              {/* Status Update */}

              <div className="status-update">

                <label>
                  Update Order Status
                </label>

                <select
                  value={order.orderStatus}
                  onChange={(e) =>
                    updateStatus(
                      order._id,
                      e.target.value
                    )
                  }
                >
                  <option value="PLACED">
                    Placed
                  </option>

                  <option value="CONFIRMED">
                    Confirmed
                  </option>

                  <option value="SHIPPED">
                    Shipped
                  </option>

                  <option value="OUT_FOR_DELIVERY">
                    Out for Delivery
                  </option>

                  <option value="DELIVERED">
                    Delivered
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>

              </div>

              {/* Date */}

              <div className="admin-order-date">
                Ordered on{" "}
                {new Date(
                  order.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default AdminOrders;