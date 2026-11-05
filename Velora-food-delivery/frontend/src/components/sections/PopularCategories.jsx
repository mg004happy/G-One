import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';
import CategoryCard from '../cards/CategoryCard';

const PopularCategories = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const handleClick = (category) => {
    navigate(category ? `/restaurants?category=${category}` : '/restaurants');
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Explore by category
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Find something you’re craving</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button 
              onClick={() => scroll('left')}
              className="rounded-full border p-2 transition-colors hover:bg-[var(--color-bg-tertiary)]"
              style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="rounded-full border p-2 transition-colors hover:bg-[var(--color-bg-tertiary)]"
              style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto no-scrollbar px-4 py-4 -mx-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[{ value: null, label: 'All', image: '/images/categories/pizza.jpg' }, ...CATEGORIES].map((cat, index) => (
              <CategoryCard key={cat.value || `all-${index}`} category={cat} onClick={handleClick} isActive={!cat.value} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
