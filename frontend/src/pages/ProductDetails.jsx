import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Wishlist
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const navigate = useNavigate();

  // Fetch Product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/products/${id}`);

        setProduct(response.data.product);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch Reviews
  const fetchReviews = async () => {
    try {
      setReviewLoading(true);

      const response = await api.get(
        `/reviews/product/${id}`
      );

      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (error) {
      console.log("Failed to fetch reviews");
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // Check Wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await api.get("/wishlist");

        const wishlistProducts =
          response.data.wishlist?.products || [];

        const exists = wishlistProducts.some(
          (wishlistProduct) =>
            wishlistProduct._id === id
        );

        setIsWishlisted(exists);
      } catch (error) {
        console.log("Failed to check wishlist");
      }
    };

    checkWishlist();
  }, [id]);

  // Quantity
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Add Cart
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to add products to cart");
      navigate("/login");
      return;
    }

    try {
      const response = await api.post("/cart", {
        productId: product._id,
        quantity,
      });

      alert(response.data.message);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to add product to cart"
      );
    }
  };

  // Wishlist
  const handleWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to use wishlist");
      navigate("/login");
      return;
    }

    try {
      setWishlistLoading(true);

      if (!isWishlisted) {
        const response = await api.post("/wishlist", {
          productId: product._id,
        });

        setIsWishlisted(true);

        alert(response.data.message);
      } else {
        const response = await api.delete(
          `/wishlist/${product._id}`
        );

        setIsWishlisted(false);

        alert(response.data.message);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update wishlist"
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // Add Review
  const handleAddReview = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to write a review");
      navigate("/login");
      return;
    }

    if (!comment.trim()) {
      alert("Please enter your review");
      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await api.post(
        `/reviews/product/${id}`,
        {
          rating,
          comment,
        }
      );

      alert(response.data.message);

      setRating(5);
      setComment("");

      await fetchReviews();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to add review"
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Start Edit Review
  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  // Update Review
  const handleUpdateReview = async (reviewId) => {
    if (!editComment.trim()) {
      alert("Please enter your review");
      return;
    }

    try {
      const response = await api.put(
        `/reviews/${reviewId}`,
        {
          rating: editRating,
          comment: editComment,
        }
      );

      alert(response.data.message);

      handleCancelEdit();

      await fetchReviews();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update review"
      );
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await api.delete(
        `/reviews/${reviewId}`
      );

      alert(response.data.message);

      await fetchReviews();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete review"
      );
    }
  };

  // Check current user
  const currentUser = localStorage.getItem("user");

  let currentUserId = null;

  try {
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      currentUserId = parsedUser._id || parsedUser.id;
    }
  } catch (error) {
    console.log("Failed to read user");
  }

  if (loading) {
    return (
      <div className="product-details-message">
        Loading product...
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-message error">
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-message">
        Product not found
      </div>
    );
  }

  return (
    <div className="product-details-page">

      <Link to="/products" className="back-link">
        ← Back to Products
      </Link>

      <div className="product-details-card">

        {/* Product Image */}
        <div className="details-image">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
            />
          ) : (
            <span>🛍️</span>
          )}
        </div>

        {/* Product Information */}
        <div className="details-info">

          <span className="details-category">
            {product.category}
          </span>

          <h1>{product.name}</h1>

          <p className="details-description">
            {product.description}
          </p>

          <div className="details-price">
            ₹{product.price}
          </div>

          <div className="details-stock">
            {product.stock > 0
              ? `✓ ${product.stock} items available`
              : "✕ Out of Stock"}
          </div>

          {/* Wishlist */}
          <button
            className={`wishlist-btn ${
              isWishlisted ? "wishlisted" : ""
            }`}
            onClick={handleWishlist}
            disabled={wishlistLoading}
          >
            {isWishlisted
              ? "❤️ Remove from Wishlist"
              : "♡ Add to Wishlist"}
          </button>

          {product.stock > 0 && (
            <>
              <div className="quantity-section">
                <span>Quantity</span>

                <div className="quantity-control">
                  <button onClick={decreaseQuantity}>
                    −
                  </button>

                  <span>{quantity}</span>

                  <button onClick={increaseQuantity}>
                    +
                  </button>
                </div>
              </div>

              <button
                className="add-cart-btn"
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= REVIEWS ================= */}

      <div className="reviews-section">

        <div className="reviews-header">
          <h2>Customer Reviews</h2>

          <div className="rating-summary">
            <span className="average-rating">
              ⭐ {averageRating}
            </span>

            <span>
              {totalReviews}{" "}
              {totalReviews === 1 ? "Review" : "Reviews"}
            </span>
          </div>
        </div>

        {/* Add Review */}
        <div className="add-review-box">

          <h3>Write a Review</h3>

          <form onSubmit={handleAddReview}>

            <div className="star-input">

              <span>Rating:</span>

              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={
                    star <= rating
                      ? "star active"
                      : "star"
                  }
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder="Write your review..."
              rows="4"
            />

            <button
              type="submit"
              className="submit-review-btn"
              disabled={reviewSubmitting}
            >
              {reviewSubmitting
                ? "Submitting..."
                : "Submit Review"}
            </button>

          </form>

          <p className="review-note">
            * You can review only products you have
            purchased and received.
          </p>
        </div>

        {/* Review List */}
        <div className="review-list">

          {reviewLoading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="no-reviews">
              No reviews yet. Be the first to review this
              product!
            </p>
          ) : (
            reviews.map((review) => {

              const reviewUserId =
                review.user?._id || review.user;

              const isMyReview =
                currentUserId &&
                reviewUserId &&
                String(currentUserId) ===
                  String(reviewUserId);

              return (
                <div
                  className="review-card"
                  key={review._id}
                >

                  {editingReviewId === review._id ? (

                    /* Edit Review */
                    <div className="edit-review">

                      <h4>Edit Your Review</h4>

                      <div className="star-input">

                        <span>Rating:</span>

                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <button
                              type="button"
                              key={star}
                              className={
                                star <= editRating
                                  ? "star active"
                                  : "star"
                              }
                              onClick={() =>
                                setEditRating(star)
                              }
                            >
                              ★
                            </button>
                          )
                        )}

                      </div>

                      <textarea
                        value={editComment}
                        onChange={(e) =>
                          setEditComment(e.target.value)
                        }
                        rows="4"
                      />

                      <div className="review-actions">

                        <button
                          className="save-review-btn"
                          onClick={() =>
                            handleUpdateReview(
                              review._id
                            )
                          }
                        >
                          Save
                        </button>

                        <button
                          className="cancel-review-btn"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    /* Normal Review */
                    <>
                      <div className="review-top">

                        <strong>
                          {review.user?.name ||
                            "User"}
                        </strong>

                        <span className="review-stars">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>

                      </div>

                      <p className="review-comment">
                        {review.comment}
                      </p>

                      <small>
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString()}
                      </small>

                      {isMyReview && (
                        <div className="review-actions">

                          <button
                            className="edit-review-btn"
                            onClick={() =>
                              handleEditClick(review)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-review-btn"
                            onClick={() =>
                              handleDeleteReview(
                                review._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>
                      )}
                    </>
                  )}

                </div>
              );
            })
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;