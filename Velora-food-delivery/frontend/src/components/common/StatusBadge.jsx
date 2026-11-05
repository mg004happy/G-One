import Badge from './Badge';

const STATUS_CONFIG = {
  PENDING: { variant: 'warning', label: 'Pending' },
  CONFIRMED: { variant: 'info', label: 'Confirmed' },
  PREPARING: { variant: 'info', label: 'Preparing' },
  OUT_FOR_DELIVERY: { variant: 'primary', label: 'Out for Delivery' },
  DELIVERED: { variant: 'success', label: 'Delivered' },
  CANCELLED: { variant: 'error', label: 'Cancelled' },
  ACTIVE: { variant: 'success', label: 'Active' },
  BLOCKED: { variant: 'error', label: 'Blocked' },
  SUSPENDED: { variant: 'warning', label: 'Suspended' },
  PAID: { variant: 'success', label: 'Paid' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  FAILED: { variant: 'error', label: 'Failed' },
};

const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || { variant: 'default', label: status };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
