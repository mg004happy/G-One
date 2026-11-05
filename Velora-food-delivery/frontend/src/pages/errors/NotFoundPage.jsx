import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Home } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
    <div className="text-center animate-fade-in-up">
      <div className="text-8xl mb-4">🍕</div>
      <h1 className="text-6xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>404</h1>
      <p className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Page Not Found
      </p>
      <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
        The page you're looking for doesn't exist. Maybe it was eaten? Let's get you back on track.
      </p>
      <Link to="/">
        <Button size="lg"><Home className="w-4 h-4" /> Back to Home</Button>
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
