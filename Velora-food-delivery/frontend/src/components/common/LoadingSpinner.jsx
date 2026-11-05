import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2
        className={`${sizes[size]} animate-spin`}
        style={{ color: 'var(--color-primary)' }}
      />
      {text && (
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
