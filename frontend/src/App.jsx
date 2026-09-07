import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// =========================
// Authentication
// =========================
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";


// =========================
// Layouts & Protection
// =========================
import MainLayout from "./components/MainLayout";
import AdminLayout from "./components/AdminLayout";
import UserLayout from "./components/UserLayout";
import ProtectedRoute from "./components/ProtectedRoute";


// =========================
// User Pages
// =========================
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Notifications from "./pages/Notifications";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard";


// =========================
// Admin Pages
// =========================
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AdminCoupons from "./pages/AdminCoupons";
import AdminBuyers from "./pages/AdminBuyers";
import AdminSellers from "./pages/AdminSellers";
import AdminSellerProducts from "./pages/AdminSellerProducts";
import AdminSellerOrders from "./pages/AdminSellerOrders";
import AdminSupportTickets from "./pages/AdminSupportTickets";


// =========================
// Seller Pages
// =========================
import SellerRegister from "./pages/SellerRegister";
import SellerLogin from "./pages/SellerLogin";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import SellerAddProduct from "./pages/SellerAddProduct";
import SellerEditProduct from "./pages/SellerEditProduct";
import SellerOrders from "./pages/SellerOrders";


// =========================
// Support Pages
// =========================
import SupportTickets from "./pages/SupportTickets";
import CreateSupportTicket from "./pages/CreateSupportTicket";
import SupportTicketDetails from "./pages/SupportTicketDetails";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==================================================
            AUTHENTICATION
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==================================================
            PUBLIC HOME
        ================================================== */}

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

        </Route>


        {/* ==================================================
            USER PAGES
        ================================================== */}

        <Route element={<ProtectedRoute role="user" />}>

          <Route element={<UserLayout />}>

            {/* User Dashboard */}
            <Route
              path="/user/dashboard"
              element={<UserDashboard />}
            />

            {/* Products */}
            <Route
              path="/products"
              element={<Products />}
            />

            <Route
              path="/products/:id"
              element={<ProductDetails />}
            />

            {/* Cart */}
            <Route
              path="/cart"
              element={<Cart />}
            />

            {/* Checkout */}
            <Route
              path="/checkout"
              element={<Checkout />}
            />

            {/* Orders */}
            <Route
              path="/orders"
              element={<Orders />}
            />

            <Route
              path="/orders/:id"
              element={<OrderDetails />}
            />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={<Notifications />}
            />

            {/* Wishlist */}
            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={<Profile />}
            />


            {/* ==================================================
                USER SUPPORT
            ================================================== */}

            <Route
              path="/support-tickets"
              element={<SupportTickets />}
            />

            <Route
              path="/support-tickets/create"
              element={<CreateSupportTicket />}
            />

            <Route
              path="/support-tickets/:id"
              element={<SupportTicketDetails />}
            />

          </Route>

        </Route>


        {/* ==================================================
            ADMIN PAGES
        ================================================== */}

        <Route element={<ProtectedRoute role="admin" />}>

          <Route element={<AdminLayout />}>

            {/* Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            {/* Admin Orders */}
            <Route
              path="/admin/orders"
              element={<AdminOrders />}
            />

            {/* Admin Products */}
            <Route
              path="/admin/products"
              element={<AdminProducts />}
            />

            <Route
              path="/admin/products/add"
              element={<AddProduct />}
            />

            <Route
              path="/admin/products/edit/:id"
              element={<EditProduct />}
            />

            {/* Coupons */}
            <Route
              path="/admin/coupons"
              element={<AdminCoupons />}
            />

            {/* Buyers */}
            <Route
              path="/admin/buyers"
              element={<AdminBuyers />}
            />

            {/* Sellers */}
            <Route
              path="/admin/sellers"
              element={<AdminSellers />}
            />

            <Route
              path="/admin/sellers/:sellerId/products"
              element={<AdminSellerProducts />}
            />

            <Route
              path="/admin/sellers/:sellerId/orders"
              element={<AdminSellerOrders />}
            />


            {/* ==================================================
                ADMIN SUPPORT
            ================================================== */}

            <Route
              path="/admin/support-tickets"
              element={<AdminSupportTickets />}
            />

            <Route
              path="/admin/support-tickets/:id"
              element={<SupportTicketDetails />}
            />

          </Route>

        </Route>


        {/* ==================================================
            SELLER AUTHENTICATION
        ================================================== */}

        <Route
          path="/seller/register"
          element={<SellerRegister />}
        />

        <Route
          path="/seller/login"
          element={<SellerLogin />}
        />


        {/* ==================================================
            SELLER PAGES
        ================================================== */}

        <Route element={<ProtectedRoute role="seller" />}>

          <Route element={<UserLayout />}>

            {/* Seller Dashboard */}
            <Route
              path="/seller/dashboard"
              element={<SellerDashboard />}
            />

            {/* Seller Products */}
            <Route
              path="/seller/products"
              element={<SellerProducts />}
            />

            {/* Seller Add Product */}
            <Route
              path="/seller/products/add"
              element={<SellerAddProduct />}
            />

            {/* Seller Edit Product */}
            <Route
              path="/seller/products/edit/:id"
              element={<SellerEditProduct />}
            />

            {/* Seller Orders */}
            <Route
              path="/seller/orders"
              element={<SellerOrders />}
            />

            {/* Seller Notifications */}
            <Route
              path="/seller/notifications"
              element={<Notifications />}
            />


            {/* ==================================================
                SELLER SUPPORT
            ================================================== */}

            <Route
              path="/seller/support-tickets"
              element={<SupportTickets />}
            />

            <Route
              path="/seller/support-tickets/create"
              element={<CreateSupportTicket />}
            />

            <Route
              path="/seller/support-tickets/:id"
              element={<SupportTicketDetails />}
            />

          </Route>

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;