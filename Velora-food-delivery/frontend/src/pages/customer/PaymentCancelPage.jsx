import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import MainLayout from '../../layouts/MainLayout';
import { ShoppingCart, Home } from 'lucide-react';

const PaymentCancelPage = () => (
  <MainLayout>
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in-up">
      <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-error-light)' }}>
        <span className="text-4xl">❌</span>
      </div>
      <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Payment Cancelled
      </h1>
      <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        Your payment was cancelled. Your items are still in your cart — you can try again anytime.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/cart"><Button><ShoppingCart className="w-4 h-4" /> Back to Cart</Button></Link>
        <Link to="/"><Button variant="secondary"><Home className="w-4 h-4" /> Go Home</Button></Link>
      </div>
    </div>
  </MainLayout>
);

export default PaymentCancelPage;
