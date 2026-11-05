import { Outlet } from 'react-router-dom';

/**
 * Auth layout — centered card on gradient background.
 * Adapts to dark mode via the bg-gradient-hero utility class.
 */
const AuthLayout = ({ children }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-hero"
    >
      <div className="w-full max-w-md animate-fade-in-up">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AuthLayout;
