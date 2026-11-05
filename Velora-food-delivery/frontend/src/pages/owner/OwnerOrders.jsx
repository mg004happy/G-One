import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ArrowLeft, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';
import { usePolling } from '../../hooks/usePolling';

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const OwnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await orderService.getRestaurantOrders();
      setOrders(data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // loadOrders updates state after its asynchronous request completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, []);
  usePolling(loadOrders);

  const handleStatusUpdate = async (id, status) => {
    try {
      await orderService.updateStatus(id, { orderStatus: status });
      toast.success(`Order updated to ${status.replace(/_/g, ' ')}`);
      loadOrders();
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/owner" className="p-2 rounded-xl transition-colors hover:bg-[var(--color-bg-tertiary)]">
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
            <Package className="inline w-6 h-6 mr-2" /> Restaurant Orders
          </h1>
        </div>

        {loading ? <LoadingSpinner text="Loading orders..." /> : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📦</p>
            <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>No orders yet</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Orders will appear here when customers order from your restaurant</p>
          </div>
        ) : (
          <div className="grid gap-4 stagger-children">
            {orders.map((order) => {
              const next = getNextStatus(order.orderStatus);
              return (
                <div key={order.id} className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>#{order.orderNumber}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{order.customerName} • {formatDateTime(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.orderStatus} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {order.items?.map((item) => (
                      <span key={item.id} className="px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                        {item.foodItemName} × {item.quantity}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(order.totalAmount)}</span>
                    {next && (
                      <Button size="sm" onClick={() => handleStatusUpdate(order.id, next)}>
                        {order.orderStatus === 'PENDING' ? 'Confirm Order' : `Mark as ${next.replace(/_/g, ' ')}`}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OwnerOrders;
