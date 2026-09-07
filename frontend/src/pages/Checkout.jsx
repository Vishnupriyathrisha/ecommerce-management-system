import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load Razorpay Checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // Handle COD Order
  const handleCODOrder = async () => {
    const response = await api.post("/orders", {
      shippingAddress: shippingAddress.trim(),
      paymentMethod: "COD",
      ...(couponCode.trim() && {
        couponCode: couponCode.trim(),
      }),
    });

    alert(response.data.message);

    navigate("/orders");
  };

  // Handle Online Payment
  const handleOnlinePayment = async () => {
    // 1. Create our order
    const orderResponse = await api.post("/orders", {
      shippingAddress: shippingAddress.trim(),
      paymentMethod: "ONLINE",
      ...(couponCode.trim() && {
        couponCode: couponCode.trim(),
      }),
    });

    const createdOrder = orderResponse.data.order;

    if (!createdOrder?._id) {
      throw new Error("Order ID was not returned");
    }

    // 2. Load Razorpay
    const razorpayLoaded = await loadRazorpayScript();

    if (!razorpayLoaded) {
      throw new Error(
        "Razorpay failed to load. Please check your internet connection."
      );
    }

    // 3. Create Razorpay payment order
    const paymentResponse = await api.post(
      "/orders/payment/create",
      {
        orderId: createdOrder._id,
      }
    );

    const {
      razorpayOrderId,
      amount,
      currency,
      key,
    } = paymentResponse.data;

    // 4. Razorpay options
    const options = {
      key,
      amount,
      currency,
      name: "ShopEase",
      description: "E-commerce Order Payment",

      order_id: razorpayOrderId,

      handler: async function (paymentResponse) {
        try {
          setLoading(true);
          setError("");

          // 5. Verify payment
          await api.post("/orders/payment/verify", {
            orderId: createdOrder._id,
            razorpay_order_id:
              paymentResponse.razorpay_order_id,
            razorpay_payment_id:
              paymentResponse.razorpay_payment_id,
            razorpay_signature:
              paymentResponse.razorpay_signature,
          });

          alert("Payment successful! 🎉");

          navigate("/orders");
        } catch (error) {
          setError(
            error.response?.data?.message ||
              "Payment verification failed"
          );
        } finally {
          setLoading(false);
        }
      },

      prefill: {
        name:
          JSON.parse(localStorage.getItem("user"))?.name ||
          "",
        email:
          JSON.parse(localStorage.getItem("user"))?.email ||
          "",
      },

      theme: {
        color: "#111111",
      },

      modal: {
        ondismiss: function () {
          setLoading(false);
          setError(
            "Payment was cancelled. Your order is still pending."
          );
        },
      },
    };

    // 6. Open Razorpay
    const razorpay = new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      function (response) {
        setLoading(false);

        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );
      }
    );

    razorpay.open();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");

    if (!shippingAddress.trim()) {
      setError("Shipping address is required");
      return;
    }

    try {
      setLoading(true);

      if (paymentMethod === "COD") {
        await handleCODOrder();
      } else {
        await handleOnlinePayment();
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to place order"
      );

      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">

      <div className="checkout-container">

        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>

        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}

        <form
          className="checkout-card"
          onSubmit={handlePlaceOrder}
        >

          {/* Shipping Address */}

          <div className="checkout-section">
            <h2>📍 Shipping Address</h2>

            <label>
              Delivery Address
            </label>

            <textarea
              placeholder="Enter your complete delivery address"
              value={shippingAddress}
              onChange={(e) =>
                setShippingAddress(e.target.value)
              }
              rows="5"
            />
          </div>

          {/* Payment */}

          <div className="checkout-section">
            <h2>💳 Payment Method</h2>

            <label className="payment-option">

              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <div>
                <strong>Cash on Delivery</strong>
                <span>
                  Pay when your order arrives
                </span>
              </div>

            </label>

            <label className="payment-option">

              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                checked={paymentMethod === "ONLINE"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <div>
                <strong>Online Payment</strong>
                <span>
                  Pay securely using Razorpay
                </span>
              </div>

            </label>

          </div>

          {/* Coupon */}

          <div className="checkout-section">
            <h2>🎟️ Coupon</h2>

            <div className="coupon-box">

              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) =>
                  setCouponCode(e.target.value)
                }
              />

            </div>

            <small>
              Leave empty if you don't have a coupon.
            </small>
          </div>

          {/* Place Order */}

          <button
            type="submit"
            className="place-order-btn"
            disabled={loading}
          >
            {loading
              ? paymentMethod === "ONLINE"
                ? "Opening Payment..."
                : "Placing Order..."
              : paymentMethod === "ONLINE"
              ? "Pay Now"
              : "Place Order"}
          </button>

          <button
            type="button"
            className="back-cart-btn"
            onClick={() => navigate("/cart")}
            disabled={loading}
          >
            ← Back to Cart
          </button>

        </form>

      </div>

    </div>
  );
};

export default Checkout;

