import { useEffect, useState } from "react";
import api from "../services/api";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/auth/profile");

      const userData = response.data.user;

      setUser(userData);

      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle profile input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await api.put("/auth/profile", formData);

      setUser(response.data.user);

      setMessage("Profile updated successfully");

      // Refresh profile data
      fetchProfile();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle password input
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      setChangingPassword(true);
      setMessage("");
      setError("");

      const response = await api.put(
        "/auth/change-password",
        passwordData
      );

      setMessage(response.data.message);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-container">

        <h1>My Profile</h1>

        {message && (
          <div className="profile-success">
            {message}
          </div>
        )}

        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        {/* Profile Information */}
        <div className="profile-card">

          <div className="profile-header">
            <div className="profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="profile-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>

          </form>
        </div>

        {/* Change Password */}
        <div className="profile-card password-card">

          <h2>Change Password</h2>

          <form onSubmit={handleChangePassword}>

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                minLength="6"
                required
              />
            </div>

            <button
              type="submit"
              className="profile-button password-button"
              disabled={changingPassword}
            >
              {changingPassword
                ? "Changing..."
                : "Change Password"}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;

