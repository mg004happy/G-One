import { Plus, Heart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const FoodCard = ({ food, onAddToCart, compact = false, showRestaurantName = false }) => {
  const { id, name, description, price, imageUrl, available, veg, category, restaurantActive } = food;
  const isRestaurantClosed = restaurantActive === false;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer, user } = useAuth();
  const tieUpEligible = Boolean(isCustomer && user?.companyAffiliated && user?.affiliatedCompany
    && food.restaurantTieUpCompanies?.some((company) => company.toLowerCase() === user.affiliatedCompany.toLowerCase()));
  const customerPrice = Math.round((Number(price) * 0.5 + Number.EPSILON) * 100) / 100;
  
  // Select wishlist items to check if this food item is wishlisted
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item.foodItemId === id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    if (!isCustomer) {
      toast.error('Only customers can wishlist items');
      return;
    }

    if (isWishlisted) {
      dispatch(removeFromWishlist(id))
        .unwrap()
        .then(() => toast.success('Removed from wishlist'))
        .catch((err) => toast.error(err));
    } else {
      dispatch(addToWishlist(id))
        .unwrap()
        .then(() => toast.success('Added to wishlist! 💜'))
        .catch((err) => toast.error(err));
    }
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative ${compact ? 'flex' : 'flex flex-col h-full'}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Wishlist Heart Button overlay on top right */}
      {isCustomer !== false && (
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full glass bg-white/70 backdrop-blur-md shadow-sm border border-white/50 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[var(--color-secondary)] text-[var(--color-secondary)]' : 'text-gray-500 hover:text-[var(--color-secondary)]'
            }`}
          />
        </button>
      )}

      {/* Image */}
      <div className={`relative overflow-hidden group ${compact ? 'w-32 h-32 flex-shrink-0' : 'h-48'}`}>
        <img
          src={imageUrl || '/images/default-food.jpg'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {(!available || isRestaurantClosed) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-sm font-bold uppercase tracking-wider px-3 py-1.5 border border-white/20 rounded-lg">
              {isRestaurantClosed ? 'Restaurant Closed' : 'Sold Out'}
            </span>
          </div>
        )}
        
        {/* Veg/Non-veg indicator */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm border border-white/50">
          <div className={veg ? 'veg-indicator' : 'nonveg-indicator'} />
        </div>
      </div>

      {/* Content */}
      <div className={`p-5 flex flex-col justify-between flex-1`}>
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4
              className="font-black text-lg tracking-tight leading-snug line-clamp-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {name}
            </h4>
            {category && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                }}
              >
                {category}
              </span>
            )}
          </div>
          {showRestaurantName && food.restaurantName && (
            <p className="mb-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              From {food.restaurantName}
            </p>
          )}
          {!compact && description && (
            <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
          {tieUpEligible ? <div className="flex flex-col items-start">
            <span className="text-xs line-through" style={{ color: 'var(--color-text-tertiary)' }}>{formatCurrency(price)}</span>
            <span className="text-xl font-black text-emerald-600">{formatCurrency(customerPrice)} <span className="text-xs font-semibold">your 50% price</span></span>
          </div> : <span className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(price)}</span>}
          {available !== false && onAddToCart && (
            <Button
              size="sm"
              className="rounded-xl shadow-md hover:shadow-lg transition-all"
              disabled={isRestaurantClosed}
              onClick={() => onAddToCart({ foodItemId: id, quantity: 1 })}
            >
              {!isRestaurantClosed && <Plus className="w-4 h-4 mr-1" />}
              {isRestaurantClosed ? 'Closed' : 'Add'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
