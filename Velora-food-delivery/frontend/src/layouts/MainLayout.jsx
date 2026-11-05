import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/**
 * Main layout for customer-facing pages — Navbar + content + Footer.
 */
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar />
      <div aria-hidden="true" className="h-[72px] flex-shrink-0" />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
