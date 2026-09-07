import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const categories = [
    {
      name: "Fashion",
      icon: "👗",
    },
    {
      name: "Electronics",
      icon: "📱",
    },
    {
      name: "Beauty",
      icon: "💄",
    },
    {
      name: "Home",
      icon: "🏠",
    },
  ];

  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-small-text">
            WELCOME TO SHOPEASE
          </p>

          <h1>
            Shop Smart.
            <br />
            Live Better.
          </h1>

          <p className="hero-description">
            Discover amazing products at the best prices.
            Shop your favorites all in one place.
          </p>

          <Link to="/products" className="shop-now-btn">
            Shop Now →
          </Link>
        </div>

        <div className="hero-image">
          🛍️
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="section-heading">
          <h2>Shop by Category</h2>

          <p>
            Explore our popular categories
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <div
              className="category-card"
              key={category.name}
            >
              <div className="category-icon">
                {category.icon}
              </div>

              <h3>{category.name}</h3>

              <Link to="/products">
                Explore →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-heading">
          <h2>Featured Products</h2>

          <p>
            Our most popular products
          </p>
        </div>

        <div className="product-placeholder">
          <div>
            <span>🛒</span>

            <h3>Products Coming Soon</h3>

            <p>
              Browse our collection and find
              something you love.
            </p>

            <Link
              to="/products"
              className="browse-btn"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;