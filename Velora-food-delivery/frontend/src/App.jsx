import { useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import { fetchCart } from './store/slices/cartSlice';
import { fetchWishlist } from './store/slices/wishlistSlice';
import { ROLES } from './utils/constants';

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
}

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.role === ROLES.CUSTOMER) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, user]);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
          <ScrollToTop />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: 'toast-custom',
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
              },
            }}
          />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
