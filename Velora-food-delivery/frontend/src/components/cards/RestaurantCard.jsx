import { Star, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatTime, slugify } from '../../utils/formatters';

const RestaurantCard = ({ restaurant }) => {
  const {
    id,
    name,
    description,
    imageUrl,
    address,
    averageRating,
    totalReviews,
    openingTime,
    closingTime,
    active,
  } = restaurant;

  return (
    <Link to={`/restaurants/${slugify(name) || id}`} className="block group h-full">
      <div
        className="h-full overflow-hidden rounded-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Image & Badges */}
        <div className="relative h-44 overflow-hidden sm:h-48">
          <img
            src={imageUrl || '/images/default-restaurant.jpg'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          
          {!active && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg tracking-wide uppercase px-4 py-2 border-2 border-white/20 rounded-xl">Closed</span>
            </div>
          )}
          
          {averageRating > 0 && (
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
              <Star className="h-3.5 w-3.5 fill-[var(--color-secondary)] text-[var(--color-secondary)]" />
              <span>{averageRating.toFixed(1)}</span>
              {totalReviews > 0 && <span style={{ color: 'var(--color-text-tertiary)' }}>({totalReviews})</span>}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex h-[10.5rem] flex-col justify-between p-4 sm:h-[11rem]">
          <div className="min-h-0">
            <h3
              className="mb-1.5 truncate text-lg font-bold transition-colors group-hover:text-[var(--color-primary)]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {name}
            </h3>
            <p
              className="mb-2 line-clamp-1 text-xs leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {description || 'Experience a culinary journey crafted with the finest ingredients.'}
            </p>
          </div>
          
          {/* Meta Data */}
          <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2.5 text-[11px] font-medium" style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-tertiary)' }}>
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[120px]">{address}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--color-bg-tertiary)] px-2 py-1 rounded-md text-[var(--color-text-secondary)]">
              <Clock className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">{formatTime(openingTime)} - {formatTime(closingTime)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
