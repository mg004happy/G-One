const CategoryCard = ({ category, onClick, isActive }) => {
  return (
    <div
      onClick={() => onClick?.(category.value)}
      className="group flex w-20 flex-shrink-0 cursor-pointer flex-col items-center gap-2.5 sm:w-24"
    >
      <div className={`h-[4.25rem] w-[4.25rem] overflow-hidden rounded-full bg-[var(--color-secondary-light)] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg sm:h-20 sm:w-20 ${isActive ? 'ring-[3px] ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg)]' : ''}`}>
        <img
          src={category.image}
          alt={category.label}
          className="w-full h-full object-cover"
        />
      </div>
      <span
        className="text-center text-xs font-semibold transition-colors duration-200 group-hover:text-[var(--color-primary)] sm:text-sm"
        style={{ color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-primary)' }}
      >
        {category.label}
      </span>
    </div>
  );
};

export default CategoryCard;
