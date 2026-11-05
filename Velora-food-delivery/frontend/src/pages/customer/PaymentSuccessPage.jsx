import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getPaymentBySessionId } from '../../store/slices/paymentSlice';
import Button from '../../components/common/Button';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Package, Home, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const dispatch = useDispatch();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState(sessionId ? null : 'No session ID found in URL parameters.');

  useEffect(() => {
    if (!sessionId) return;

    const fetchPaymentInfo = async () => {
      try {
        const result = await dispatch(getPaymentBySessionId(sessionId)).unwrap();
        setPayment(result);
      } catch (err) {
        setError(err || 'Failed to fetch payment details.');
        toast.error('Could not verify payment status.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [sessionId, dispatch]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="mt-6 text-sm font-semibold animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>
            Verifying secure payment transaction...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 shadow-sm">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-black mb-3 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Verification Failed
          </h1>
          <p className="mb-8 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/orders">
              <Button className="rounded-xl px-5 font-bold flex items-center justify-center gap-2">
                <Package className="w-4 h-4" /> View Orders
              </Button>
            </Link>
            <Link to="/">
              <Button variant="secondary" className="rounded-xl px-5 font-bold flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> Go Home
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 shadow-md">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 fill-emerald-50 dark:fill-transparent" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Payment Successful! 🎉
        </h1>
        <p className="mb-8 text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Your payment has been successfully processed. Your order is now confirmed and sent to the kitchen!
        </p>

        {payment && (
          <div
            className="rounded-3xl p-6 mb-8 text-left space-y-4 shadow-sm relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Order Number</span>
              <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>#{payment.orderNumber}</span>
            </div>
            
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Amount Paid</span>
              <span className="font-black text-base text-[var(--color-primary)]">{formatCurrency(payment.amount)}</span>
            </div>
            
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Payment Method</span>
              <span className="font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)]" style={{ color: 'var(--color-text-primary)' }}>
                {payment.paymentMethod?.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Status</span>
              <span
                className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30"
              >
                {payment.paymentStatus}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="flex-1 sm:flex-initial">
            <Button className="w-full rounded-xl px-6 py-3.5 font-bold flex items-center justify-center gap-2">
              <Package className="w-4 h-4" /> Track Order
            </Button>
          </Link>
          <Link to="/" className="flex-1 sm:flex-initial">
            <Button variant="secondary" className="w-full rounded-xl px-6 py-3.5 font-bold flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccessPage;
