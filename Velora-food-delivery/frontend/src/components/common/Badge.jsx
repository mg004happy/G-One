const Badge = ({ children, variant = 'default', className = '' }) => {
  const styles = {
    default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
    primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
    success: 'bg-[var(--color-success-light)] text-[#065F46]',
    warning: 'bg-[var(--color-warning-light)] text-[#92400E]',
    error: 'bg-[var(--color-error-light)] text-[var(--color-error)]',
    info: 'bg-[var(--color-info-light)] text-[#1E40AF]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
