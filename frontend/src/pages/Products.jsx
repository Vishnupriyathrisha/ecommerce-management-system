import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (category) {
        params.category = category;
      }

      const response = await api.get("/products", {
        params,
      });

      setProducts(response.data.products || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="products-page">

      {/* Header */}
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Find your favorite products</p>
      </div>

      {/* Search & Filter */}
      <div className="product-controls">

        <form
          className="search-form"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="submit">
            Search
          </button>
        </form>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Fashion">Fashion</option>
          <option value="Electronics">Electronics</option>
          <option value="Beauty">Beauty</option>
          <option value="Home">Home</option>
        </select>

      </div>

      {/* Loading */}
      {loading && (
        <div className="products-message">
          Loading products...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="products-error">
          {error}
        </div>
      )}

      {/* Products */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div className="products-message">
              <div className="empty-icon">🛍️</div>

              <h2>No Products Found</h2>

              <p>
                Try searching for another product.
              </p>
            </div>
          ) : (
            <div className="product-grid">

              {products.map((product) => (
                <div
                  className="product-card"
                  key={product._id}
                >

                  <div className="product-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>

                  <div className="product-info">

                    <span className="product-category">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>

                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="product-bottom">

                      <span className="product-price">
                        ₹{product.price}
                      </span>

                      <span
                        className={
                          product.stock > 0
                            ? "in-stock"
                            : "out-stock"
                        }
                      >
                        {product.stock > 0
                          ? `Stock: ${product.stock}`
                          : "Out of Stock"}
                      </span>

                    </div>

                    <Link
                      to={`/products/${product._id}`}
                      className="view-product-btn"
                    >
                      View Details
                    </Link>

                  </div>
                </div>
              ))}

            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Products;