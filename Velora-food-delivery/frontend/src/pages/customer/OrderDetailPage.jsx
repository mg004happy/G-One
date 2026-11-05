import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, cancelOrder } from '../../store/slices/orderSlice';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ORDER_STATUSES } from '../../utils/constants';
import { Package, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePolling } from '../../hooks/usePolling';

const TIMELINE_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedOrder: order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);
  usePolling(() => dispatch(fetchOrderById(id)));

  const handleCancel = () => {
    dispatch(cancelOrder(id))
      .unwrap()
      .then(() => toast.success('Order cancelled'))
      .catch((err) => toast.error(err));
  };

  if (loading && !order) return <MainLayout><LoadingSpinner text="Loading order..." /></MainLayout>;
  if (!order) return <MainLayout><div className="py-20 text-center">Order not found</div></MainLayout>;

  const isCancelled = order.orderStatus === ORDER_STATUSES.CANCELLED;
  const currentStep = TIMELINE_STEPS.indexOf(order.orderStatus || 'PENDING');
  const canCancel = ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.orderStatus || '');

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b pb-6 mb-10" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                Order #{order.orderNumber}
              </h1>
              <StatusBadge status={order.orderStatus} />
            </div>
            <p className="text-sm mt-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {canCancel && (
              <Button variant="danger" size="sm" onClick={handleCancel} className="rounded-xl px-5 font-bold">
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        {!isCancelled && (
          <div
            className="rounded-3xl p-6 md:p-8 mb-10 shadow-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <h3 className="font-black text-base mb-8 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Track Shipment</h3>
            <div className="flex items-center justify-between relative px-2">
              {/* Connection line */}
              <div className="absolute top-4 left-6 right-6 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
              <div
                className="absolute top-4 left-6 h-1 rounded-full transition-all duration-700"
                style={{
                  backgroundColor: 'var(--color-success)',
                  width: `calc(${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}% - 12px)`,
                }}
              />

              {TIMELINE_STEPS.map((step, i) => {
                const isCompleted = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCurrent ? 'ring-4 ring-emerald-100 dark:ring-emerald-950/40 animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-surface)',
                        color: isCompleted ? 'white' : 'var(--color-text-tertiary)',
                        border: isCompleted ? 'none' : '2px solid var(--color-border)',
                        boxShadow: isCompleted ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : i + 1}
                    </div>
                    <span
                      className="text-[10px] mt-3.5 font-extrabold uppercase tracking-wider text-center max-w-[85px] leading-tight"
                      style={{ color: isCompleted ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                    >
                      {step.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Items */}
          <div
            className="rounded-3xl p-6 md:p-8 shadow-sm flex flex-col"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <h3 className="font-black text-lg mb-6 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Items Ordered</h3>
            <div className="space-y-4 flex-1">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {item.foodItemName}
                    </span>
                    <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--color-bg-tertiary)]" style={{ color: 'var(--color-text-secondary)' }}>
                      × {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-right" style={{ color: 'var(--color-text-primary)' }}>
                    {Number(order.companyShareAmount || 0) > 0 ? <><span className="block text-xs font-normal line-through" style={{ color: 'var(--color-text-tertiary)' }}>{formatCurrency(item.subtotal)}</span><span className="text-emerald-600">{formatCurrency(Math.round((Number(item.subtotal) * 0.5 + Number.EPSILON) * 100) / 100)} for you</span></> : formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 flex justify-between items-center" style={{ borderTop: '1.5px solid var(--color-border)' }}>
              <div className="space-y-2">
                <div className="font-semibold text-xs" style={{ color: 'var(--color-text-secondary)' }}>Order subtotal {formatCurrency(order.grossAmount ?? order.items?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) ?? 0)}</div>
                {Number(order.companyShareAmount || 0) > 0 && <div className="font-semibold text-xs text-emerald-600">{order.companyName || 'Company'} pays 50% · {formatCurrency(order.companyShareAmount)}</div>}
                <span className="font-black text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>You pay</span>
              </div>
              <span className="font-black text-xl text-[var(--color-primary)]">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Delivery Details */}
          <div
            className="rounded-3xl p-6 md:p-8 shadow-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <h3 className="font-black text-lg mb-6 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Delivery Details</h3>
            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Restaurant</p>
                  <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{order.restaurantName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Delivery Address</p>
                  <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>{order.deliveryAddress}</p>
                </div>
              </div>
              {order.phoneNumber && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Phone Number</p>
                    <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>{order.phoneNumber}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Recipient</p>
                  <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>{order.customerName}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t text-sm space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex justify-between items-center">
                <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Payment Method</span>
                <span className="font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--color-bg-tertiary)] border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                  {order.paymentMethod?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Payment Status</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetailPage;
