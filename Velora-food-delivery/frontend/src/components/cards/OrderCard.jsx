import { Link } from 'react-router-dom';
import { Package, ChevronRight, Calendar } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const OrderCard = ({ order }) => {
  const {
    id,
    orderNumber,
    restaurantName,
    totalAmount,
    orderStatus,
    items,
    createdAt,
  } = order;

  return (
    <Link to={`/orders/${id}`}>
      <div
        className="p-5 md:p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border group cursor-pointer"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-primary-light)] border border-[var(--color-primary-light)]"
            >
              <Package className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h4 className="font-bold text-base group-hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                {restaurantName}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                <span className="font-bold text-zinc-400">#{orderNumber}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDateTime(createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="self-start sm:self-center">
            <StatusBadge status={orderStatus} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              {items?.length || 0} item{items?.length !== 1 ? 's' : ''} ordered
            </p>
            <p className="text-lg font-black" style={{ color: 'var(--color-primary)' }}>
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center group-hover:bg-[var(--color-primary-light)] transition-all duration-200">
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[var(--color-primary)] transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OrderCard;
