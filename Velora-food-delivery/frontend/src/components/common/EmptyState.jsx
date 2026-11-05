const EmptyState = ({ icon = '📭', title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      {description && (
        <p className="max-w-md mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
