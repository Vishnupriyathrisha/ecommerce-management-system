import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./AdminSellerOrders.css";

const AdminSellerOrders = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSellerOrders();
  }, [sellerId]);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch seller details
      const sellerResponse = await api.get("/admin/sellers");
      const sellers = sellerResponse.data.sellers || [];

      const currentSeller = sellers.find(
        (item) => item._id === sellerId
      );

      setSeller(currentSeller || null);

      // Fetch all seller orders
      const ordersResponse = await api.get(
  `/orders/admin/seller/${sellerId}/orders`
);
      const allOrders = ordersResponse.data.orders || [];

      // Keep orders containing this seller's products
     const sellerOrders = allOrders.filter((order) =>
  order.items?.some((item) => {
    const itemSellerId =
      item.seller?._id || item.seller;

    return itemSellerId?.toString() === sellerId;
  })
);

      setOrders(sellerOrders);
    } catch (error) {
      console.error(
        "Admin Seller Orders Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to fetch seller orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const getSellerItems = (order) => {
  return (
    order.items?.filter((item) => {
      const itemSellerId =
        item.seller?._id || item.seller;

      return itemSellerId?.toString() === sellerId;
    }) || []
  );
};

  const getSellerTotal = (order) => {
    const sellerItems = getSellerItems(order);

    return sellerItems.reduce(
      (total, item) => total + (item.subtotal || 0),
      0
    );
  };

  const getStatusClass = (status) => {
    return status
      ?.toLowerCase()
      .replaceAll("_", "-");
  };

  if (loading) {
    return (
      <div className="admin-seller-orders-loading">
        Loading seller orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-seller-orders-page">
        <div className="seller-orders-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-seller-orders-page">

      {/* Header */}
      <div className="admin-seller-orders-header">

        <div>
          <button
            className="back-btn"
            onClick={() =>
              navigate("/admin/sellers")
            }
          >
            ← Back to Sellers
          </button>

          <h1>
            {seller?.name || "Seller"} - Orders
          </h1>

          <p>
            View orders received for this seller's
            products
          </p>
        </div>

        <button
          className="seller-orders-refresh-btn"
          onClick={fetchSellerOrders}
        >
          ↻ Refresh
        </button>

      </div>

      {/* Seller Info */}
      {seller && (
        <div className="seller-info-card">

          <div className="seller-info-avatar">
            {seller.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div className="seller-info-details">
            <h3>{seller.name}</h3>
            <p>{seller.email}</p>

            {seller.phone && (
              <span>{seller.phone}</span>
            )}
          </div>

          <div className="seller-order-summary">
            <strong>{orders.length}</strong>
            <span>Orders</span>
          </div>

        </div>
      )}

      {/* No Orders */}
      {orders.length === 0 ? (
        <div className="seller-orders-empty">

          <div className="seller-orders-empty-icon">
            📦
          </div>

          <h2>
            No Orders Found
          </h2>

          <p>
            This seller has not received any orders
            yet.
          </p>

        </div>
      ) : (

        /* Orders */
        <div className="admin-seller-orders-list">

          {orders.map((order) => {

            const sellerItems =
              getSellerItems(order);

            const sellerTotal =
              getSellerTotal(order);

            return (
              <div
                className="admin-seller-order-card"
                key={order._id}
              >

                {/* Order Header */}
                <div className="admin-order-top">

                  <div>
                    <h3>
                      Order #
                      {order._id
                        .slice(-8)
                        .toUpperCase()}
                    </h3>

                    <span>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`admin-order-status ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus?.replaceAll(
                      "_",
                      " "
                    )}
                  </span>

                </div>

                {/* Customer */}
                <div className="admin-order-customer">

                  <h4>
                    Customer
                  </h4>

                  <p>
                    {order.user?.name ||
                      "Unknown Customer"}
                  </p>

                  <span>
                    {order.user?.email || ""}
                  </span>

                </div>

                {/* Products */}
                <div className="admin-seller-order-products">

                  <h4>
                    Seller Products
                  </h4>

                  {sellerItems.map(
                    (item, index) => (
                      <div
                        className="admin-seller-product-item"
                        key={
                          item.product?._id ||
                          index
                        }
                      >

                        <div className="admin-product-info">

                          {item.product?.image ? (
                            <img
                              src={
                                item.product.image
                              }
                              alt={item.name}
                            />
                          ) : (
                            <div className="admin-product-placeholder">
                              🛍️
                            </div>
                          )}

                          <div>
                            <strong>
                              {item.name}
                            </strong>

                            <p>
                              ₹{item.price} ×{" "}
                              {item.quantity}
                            </p>
                          </div>

                        </div>

                        <strong>
                          ₹
                          {Number(
                            item.subtotal || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>
                    )
                  )}

                </div>

                {/* Order Details */}
                <div className="admin-seller-order-bottom">

                  <div>
                    <span>
                      Seller Total
                    </span>

                    <strong>
                      ₹
                      {Number(
                        sellerTotal
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payment
                    </span>

                    <strong>
                      {order.paymentMethod ||
                        "COD"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payment Status
                    </span>

                    <strong>
                      {order.paymentStatus ||
                        "PENDING"}
                    </strong>
                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default AdminSellerOrders;