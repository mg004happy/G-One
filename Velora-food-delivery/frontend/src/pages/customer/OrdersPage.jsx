import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../../store/slices/orderSlice';
import MainLayout from '../../layouts/MainLayout';
import OrderCard from '../../components/cards/OrderCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { usePolling } from '../../hooks/usePolling';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);
  usePolling(() => dispatch(fetchMyOrders()));

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 mb-10" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Order History
            </h1>
            <p className="text-sm mt-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Track current orders and view previous order details
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary-light)] self-start sm:self-auto">
            {orders?.length || 0} Total Order{orders?.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="py-24">
            <LoadingSpinner text="Retrieving order history..." />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon="📦"
              title="No orders yet"
              description="You haven't placed any orders. Let's find something delicious!"
              action={<Link to="/restaurants"><Button className="font-bold rounded-xl px-5 py-3">Browse Restaurants</Button></Link>}
            />
          </div>
        ) : (
          <div className="space-y-6 stagger-children animate-fade-in">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersPage;
