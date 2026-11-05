import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ---- Auth Pages ----
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

// ---- Customer Pages ----
const HomePage = lazy(() => import('../pages/customer/HomePage'));
const RestaurantListPage = lazy(() => import('../pages/customer/RestaurantListPage'));
const RestaurantDetailPage = lazy(() => import('../pages/customer/RestaurantDetailPage'));
const CartPage = lazy(() => import('../pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('../pages/customer/CheckoutPage'));
const OrdersPage = lazy(() => import('../pages/customer/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/customer/OrderDetailPage'));
const ProfilePage = lazy(() => import('../pages/customer/ProfilePage'));
const AddressesPage = lazy(() => import('../pages/customer/AddressesPage'));
const WishlistPage = lazy(() => import('../pages/customer/WishlistPage'));
const PaymentSuccessPage = lazy(() => import('../pages/customer/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('../pages/customer/PaymentCancelPage'));

// ---- Admin Pages ----
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminRestaurants = lazy(() => import('../pages/admin/AdminRestaurants'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'));

// ---- Owner Pages ----
const OwnerDashboard = lazy(() => import('../pages/owner/OwnerDashboard'));
const OwnerRestaurant = lazy(() => import('../pages/owner/OwnerRestaurant'));
const OwnerRestaurantTieUps = lazy(() => import('../pages/owner/OwnerRestaurantTieUps'));
const OwnerRestaurantEmployees = lazy(() => import('../pages/owner/OwnerRestaurantEmployees'));
const OwnerMenu = lazy(() => import('../pages/owner/OwnerMenu'));
const OwnerOrders = lazy(() => import('../pages/owner/OwnerOrders'));

// ---- Error Pages ----
const NotFoundPage = lazy(() => import('../pages/errors/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/errors/UnauthorizedPage'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner text="Loading page..." />
  </div>
);

/**
 * Master route tree — all customer, admin, and owner routes are lazy-loaded with Suspense fallback.
 */
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ---- Public Routes ---- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:slug" element={<RestaurantDetailPage />} />
        <Route path="/payment/success" element={
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        } />
        <Route path="/payment/cancel" element={
          <ProtectedRoute>
            <PaymentCancelPage />
          </ProtectedRoute>
        } />

        {/* ---- Customer Routes (Protected) ---- */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.CUSTOMER}>
                <CartPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.CUSTOMER}>
                <CheckoutPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.CUSTOMER}>
                <OrdersPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.CUSTOMER}>
                <OrderDetailPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.CUSTOMER}>
                <AddressesPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.CUSTOMER}>
                <WishlistPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ---- Admin Routes ---- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.ADMIN}>
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.ADMIN}>
                <AdminUsers />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/restaurants"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.ADMIN}>
                <AdminRestaurants />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.ADMIN}>
                <AdminOrders />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ---- Owner Routes ---- */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.RESTAURANT_OWNER}>
                <OwnerDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/restaurant"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.RESTAURANT_OWNER}>
                <OwnerRestaurant />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/restaurant/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.RESTAURANT_OWNER}>
                <OwnerRestaurant />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/restaurant/:id/employees"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.RESTAURANT_OWNER}>
                <OwnerRestaurantEmployees />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/restaurant/:id/tie-ups"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.RESTAURANT_OWNER}>
                <OwnerRestaurantTieUps />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/menu"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.RESTAURANT_OWNER}>
                <OwnerMenu />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/orders"
          element={
            <ProtectedRoute>
              <RoleRoute role={ROLES.RESTAURANT_OWNER}>
                <OwnerOrders />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ---- Error Routes ---- */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
