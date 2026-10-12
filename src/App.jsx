import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { PageSkeleton } from './components/ui';
import { useAuth } from './context/AuthContext';
import About from './pages/About';
import Account from './pages/Account';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import OrderSuccess from './pages/OrderSuccess';
import ProductDetail from './pages/ProductDetail';
import Shop from './pages/Shop';
import Signup from './pages/Signup';
import StaticPage from './pages/StaticPage';

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsAdmin = lazy(() => import('./pages/admin/ProductsAdmin'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const OrdersAdmin = lazy(() => import('./pages/admin/OrdersAdmin'));
const ManageAdmin = lazy(() => import('./pages/admin/ManageAdmin'));

function RequireAuth({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route
            path="checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="order-success/:id"
            element={
              <RequireAuth>
                <OrderSuccess />
              </RequireAuth>
            }
          />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route
            path="account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />
          <Route path="about" element={<About />} />
          <Route path="shipping" element={<StaticPage page="shipping" />} />
          <Route path="privacy" element={<StaticPage page="privacy" />} />
          <Route path="terms" element={<StaticPage page="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="admin"
          element={
            <RequireAuth role="admin">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="orders/:id" element={<OrdersAdmin />} />
          <Route path="customers" element={<ManageAdmin section="customers" />} />
          <Route path="categories" element={<ManageAdmin section="categories" />} />
          <Route path="coupons" element={<ManageAdmin section="coupons" />} />
          <Route path="reviews" element={<ManageAdmin section="reviews" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
