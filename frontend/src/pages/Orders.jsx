import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Orders.css";

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data.orders || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cancel Order
  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      const response = await api.put(
        `/orders/${orderId}/cancel`
      );

      alert(response.data.message);

      fetchOrders();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to cancel order"
      );
    }
  };

  // -------------------------
  // Pagination
  // -------------------------

  const totalPages = Math.ceil(
    orders.length / ordersPerPage
  );

  const indexOfLastOrder =
    currentPage * ordersPerPage;

  const indexOfFirstOrder =
    indexOfLastOrder - ordersPerPage;

  const currentOrders = orders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const goToPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) {
      return;
    }

    setCurrentPage(pageNumber);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="orders-message">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-message error">
        {error}
      </div>
    );
  }

  return (
    <div className="orders-page">

      {/* Header */}
      <div className="orders-header">
        <div>
          <h1>My Orders</h1>
          <p>View and manage your orders</p>
        </div>

        <Link to="/products">
          Continue Shopping
        </Link>
      </div>

      {/* No Orders */}
      {orders.length === 0 ? (
        <div className="empty-orders">

          <div className="empty-orders-icon">
            📦
          </div>

          <h2>No Orders Yet</h2>

          <p>
            You haven't placed any orders yet.
          </p>

          <Link
            to="/products"
            className="shop-orders-btn"
          >
            Start Shopping
          </Link>

        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Products</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {currentOrders.map((order) => (

                  <tr key={order._id}>

                    {/* Order ID */}
                    <td>
                      <strong>
                        #{order._id
                          .slice(-8)
                          .toUpperCase()}
                      </strong>
                    </td>

                    {/* Date */}
                    <td>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Products */}
                    <td>
                      <div className="table-products">

                        {order.items.map(
                          (item, index) => (

                            <div
                              className="table-product"
                              key={
                                item.product?._id ||
                                index
                              }
                            >

                              <div className="table-product-image">

                                {item.product?.image ? (
                                  <img
                                    src={
                                      item.product.image
                                    }
                                    alt={item.name}
                                  />
                                ) : (
                                  <span>
                                    🛍️
                                  </span>
                                )}

                              </div>

                              <div>
                                <strong>
                                  {item.name}
                                </strong>

                                <small>
                                  ₹{item.price} ×{" "}
                                  {item.quantity}
                                </small>
                              </div>

                            </div>

                          )
                        )}

                      </div>
                    </td>

                    {/* Payment */}
                    <td>
                      <span className="payment-method">
                        {order.paymentMethod}
                      </span>
                    </td>

                    {/* Total */}
                    <td>
                      <strong className="order-total-amount">
                        ₹{order.totalAmount}
                      </strong>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`order-status ${order.orderStatus?.toLowerCase()}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>

                      <div className="order-actions">

                        <Link
                          to={`/orders/${order._id}`}
                          className="view-order-details-btn"
                        >
                          View
                        </Link>

                        {[
                          "PLACED",
                          "CONFIRMED",
                        ].includes(
                          order.orderStatus
                        ) && (
                          <button
                            className="cancel-order-btn"
                            onClick={() =>
                              cancelOrder(
                                order._id
                              )
                            }
                          >
                            Cancel
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="orders-pagination">

              <button
                onClick={() =>
                  goToPage(currentPage - 1)
                }
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className="pagination-pages">

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (

                  <button
                    key={page}
                    className={
                      currentPage === page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      goToPage(page)
                    }
                  >
                    {page}
                  </button>

                ))}

              </div>

              <button
                onClick={() =>
                  goToPage(currentPage + 1)
                }
                disabled={
                  currentPage === totalPages
                }
              >
                Next →
              </button>

            </div>
          )}

          {/* Page Information */}
          <div className="orders-page-info">

            Showing{" "}
            {indexOfFirstOrder + 1} -{" "}
            {Math.min(
              indexOfLastOrder,
              orders.length
            )}{" "}
            of {orders.length} orders

          </div>

        </>
      )}

    </div>
  );
};

export default Orders;