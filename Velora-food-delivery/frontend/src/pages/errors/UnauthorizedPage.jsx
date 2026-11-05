import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Home } from 'lucide-react';

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
    <div className="text-center animate-fade-in-up">
      <div className="text-8xl mb-4">🔒</div>
      <h1 className="text-6xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>403</h1>
      <p className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Access Denied
      </p>
      <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
        You don't have permission to access this page. Please login with the correct account.
      </p>
      <Link to="/">
        <Button size="lg"><Home className="w-4 h-4" /> Back to Home</Button>
      </Link>
    </div>
  </div>
);

export default UnauthorizedPage;
