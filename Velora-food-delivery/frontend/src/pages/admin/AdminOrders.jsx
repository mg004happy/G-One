import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders } from '../../store/slices/adminSlice';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ArrowLeft, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ORDER_STATUSES } from '../../utils/constants';
import { usePolling } from '../../hooks/usePolling';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = { page, size: 10 };
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchAdminOrders(params));
  }, [dispatch, page, statusFilter]);
  usePolling(() => {
    const params = { page, size: 10 };
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchAdminOrders(params));
  });

  const list = orders?.content || (Array.isArray(orders) ? orders : []);
  const totalPages = orders?.totalPages || 0;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="p-2 rounded-xl transition-colors hover:bg-[var(--color-bg-tertiary)]">
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
            <Package className="inline w-6 h-6 mr-2" /> Order Management
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${!statusFilter ? 'bg-[var(--color-primary)] text-white' : ''}`} style={!statusFilter ? {} : { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>All</button>
          {Object.values(ORDER_STATUSES).map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }} className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${statusFilter === s ? 'bg-[var(--color-primary)] text-white' : ''}`} style={statusFilter === s ? {} : { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>{s.replace(/_/g, ' ')}</button>
          ))}
        </div>

        {loading && list.length === 0 ? <LoadingSpinner text="Loading orders..." /> : (
          <div className="grid gap-4 stagger-children">
            {list.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-5 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                  <Package className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>#{order.orderNumber}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{order.restaurantName} • {order.customerName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(order.totalAmount)}</p>
                  {Number(order.companyShareAmount || 0) > 0 && <p className="text-[10px] text-emerald-600">Company owes {formatCurrency(order.companyShareAmount)} · {order.companyName}</p>}
                  <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>{formatDateTime(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.orderStatus} />
              </div>
            ))}
            {list.length === 0 && <p className="text-center py-12" style={{ color: 'var(--color-text-tertiary)' }}>No orders found</p>}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="px-4 py-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Page {page + 1} of {totalPages}</span>
            <Button size="sm" variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminOrders;
