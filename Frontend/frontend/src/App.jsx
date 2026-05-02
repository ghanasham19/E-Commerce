import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- NEW: Import the Wishlist Provider and Page ---
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetails from './pages/AdminOrderDetails';

function App() {
  return (
    /* --- WRAP THE ENTIRE APP IN THE PROVIDER --- */
    <WishlistProvider>
      <Router>
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* ==========================================
                PUBLIC ROUTES 
               ========================================== */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* --- NEW: Wishlist Route --- */}
            <Route path="/wishlist" element={<Wishlist />} />

            {/* ==========================================
                CUSTOMER ROUTES - Must be logged in 
               ========================================== */}
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/order/:id" element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            } />

            {/* ==========================================
                STRICT ADMIN ROUTES - Must be an ADMIN 
               ========================================== */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute adminOnly={true}>
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders/:id" element={
              <ProtectedRoute adminOnly={true}>
                <AdminOrderDetails />
              </ProtectedRoute>
            } />
            
          </Routes>
        </div>

        <Footer />
      </Router>
    </WishlistProvider>
  );
}

export default App;