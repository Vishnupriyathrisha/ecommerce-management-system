import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminCoupons.css";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    expiryDate: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ================================
  // Fetch All Coupons
  // ================================
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/coupons");

      setCoupons(response.data.coupons || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch coupons"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // Handle Input Change
  // ================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================================
  // Reset Form
  // ================================
  const resetForm = () => {
    setFormData({
      code: "",
      discountPercentage: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      expiryDate: "",
    });

    setEditingCoupon(null);
  };

  // ================================
  // Create / Update Coupon
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const data = {
        discountPercentage: Number(
          formData.discountPercentage
        ),

        minOrderAmount: Number(
          formData.minOrderAmount || 0
        ),

        maxDiscountAmount:
          formData.maxDiscountAmount === ""
            ? null
            : Number(formData.maxDiscountAmount),

        expiryDate: formData.expiryDate,
      };

      // Create Coupon
      if (!editingCoupon) {
        data.code = formData.code
          .trim()
          .toUpperCase();

        await api.post("/admin/coupons", data);

        alert("Coupon created successfully");
      }

      // Update Coupon
      else {
        await api.put(
          `/admin/coupons/${editingCoupon._id}`,
          data
        );

        alert("Coupon updated successfully");
      }

      resetForm();
      fetchCoupons();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to save coupon"
      );
    }
  };

  // ================================
  // Edit Coupon
  // ================================
  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);

    setFormData({
      code: coupon.code,

      discountPercentage:
        coupon.discountPercentage,

      minOrderAmount:
        coupon.minOrderAmount || "",

      maxDiscountAmount:
        coupon.maxDiscountAmount ?? "",

      expiryDate: coupon.expiryDate
        ? coupon.expiryDate.split("T")[0]
        : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================================
  // Delete Coupon
  // ================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(
        `/admin/coupons/${id}`
      );

      alert("Coupon deleted successfully");

      fetchCoupons();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete coupon"
      );
    }
  };

  // ================================
  // Toggle Coupon Status
  // ================================
  const handleToggleStatus = async (coupon) => {
    try {
      await api.put(
        `/admin/coupons/${coupon._id}`,
        {
          isActive: !coupon.isActive,
        }
      );

      fetchCoupons();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update coupon status"
      );
    }
  };

  // ================================
  // Check Expiry
  // ================================
  const isExpired = (expiryDate) => {
    return new Date(expiryDate) <= new Date();
  };

  // ================================
  // Render
  // ================================
  return (
    <div className="admin-coupons">

      {/* ================================
          Header
      ================================ */}

      <div className="coupon-header">
        <div>
          <p className="coupon-label">
            ADMIN PANEL
          </p>

          <h1>Coupon Management</h1>

          <p>
            Create and manage discount coupons
          </p>
        </div>
      </div>

      {/* ================================
          Coupon Form
      ================================ */}

      <div className="coupon-form-card">

        <h2>
          {editingCoupon
            ? "Edit Coupon"
            : "Create New Coupon"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="coupon-form-grid">

            {/* Coupon Code */}

            <div className="form-group">
              <label>
                Coupon Code
              </label>

              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Example: SAVE20"
                disabled={!!editingCoupon}
                required={!editingCoupon}
              />
            </div>

            {/* Discount */}

            <div className="form-group">
              <label>
                Discount Percentage (%)
              </label>

              <input
                type="number"
                name="discountPercentage"
                value={
                  formData.discountPercentage
                }
                onChange={handleChange}
                min="1"
                max="100"
                placeholder="20"
                required
              />
            </div>

            {/* Minimum Order */}

            <div className="form-group">
              <label>
                Minimum Order Amount
              </label>

              <input
                type="number"
                name="minOrderAmount"
                value={
                  formData.minOrderAmount
                }
                onChange={handleChange}
                min="0"
                placeholder="500"
              />
            </div>

            {/* Maximum Discount */}

            <div className="form-group">
              <label>
                Maximum Discount
              </label>

              <input
                type="number"
                name="maxDiscountAmount"
                value={
                  formData.maxDiscountAmount
                }
                onChange={handleChange}
                min="0"
                placeholder="200"
              />
            </div>

            {/* Expiry Date */}

            <div className="form-group">
              <label>
                Expiry Date
              </label>

              <input
                type="date"
                name="expiryDate"
                value={
                  formData.expiryDate
                }
                onChange={handleChange}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                required
              />
            </div>

          </div>

          {/* Form Buttons */}

          <div className="coupon-form-actions">

            <button
              type="submit"
              className="save-coupon-btn"
            >
              {editingCoupon
                ? "Update Coupon"
                : "Create Coupon"}
            </button>

            {editingCoupon && (
              <button
                type="button"
                className="cancel-coupon-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      {/* ================================
          Error
      ================================ */}

      {error && (
        <div className="coupon-error">
          {error}
        </div>
      )}

      {/* ================================
          Coupons List
      ================================ */}

      <div className="coupons-list-card">

        <div className="coupons-list-header">

          <div>
            <h2>All Coupons</h2>

            <p>
              Manage your store discount coupons
            </p>
          </div>

          <span>
            {coupons.length} coupon
            {coupons.length !== 1
              ? "s"
              : ""}
          </span>

        </div>

        {/* Loading */}

        {loading ? (
          <div className="coupon-loading">
            Loading coupons...
          </div>
        ) : coupons.length === 0 ? (
          /* Empty */

          <div className="coupon-empty">

            <div>🎟️</div>

            <h3>
              No coupons found
            </h3>

            <p>
              Create your first discount coupon.
            </p>

          </div>
        ) : (
          /* Table */

          <div className="coupon-table-wrapper">

            <table className="coupon-table">

              <thead>

                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Max Discount</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {coupons.map((coupon) => {

                  const expired =
                    isExpired(
                      coupon.expiryDate
                    );

                  return (
                    <tr
                      key={coupon._id}
                    >

                      {/* Code */}

                      <td>
                        <strong className="coupon-code">
                          {coupon.code}
                        </strong>
                      </td>

                      {/* Discount */}

                      <td>
                        <span className="discount-value">
                          {coupon.discountPercentage}%
                        </span>
                      </td>

                      {/* Minimum Order */}

                      <td>
                        ₹
                        {coupon.minOrderAmount ||
                          0}
                      </td>

                      {/* Maximum Discount */}

                      <td>
                        {coupon.maxDiscountAmount ===
                        null
                          ? "No Limit"
                          : `₹${coupon.maxDiscountAmount}`}
                      </td>

                      {/* Expiry */}

                      <td>
                        {new Date(
                          coupon.expiryDate
                        ).toLocaleDateString()}
                      </td>

                      {/* Status */}

                      <td>

                        {expired ? (
                          <span className="coupon-status expired">
                            Expired
                          </span>
                        ) : (
                          <button
                            type="button"
                            className={`coupon-status ${
                              coupon.isActive
                                ? "active"
                                : "inactive"
                            }`}
                            onClick={() =>
                              handleToggleStatus(
                                coupon
                              )
                            }
                          >
                            {coupon.isActive
                              ? "Active"
                              : "Inactive"}
                          </button>
                        )}

                      </td>

                      {/* Actions */}

                      <td>

                        <div className="coupon-actions">

                          <button
                            type="button"
                            className="edit-coupon-btn"
                            onClick={() =>
                              handleEdit(
                                coupon
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-coupon-btn"
                            onClick={() =>
                              handleDelete(
                                coupon._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default AdminCoupons;