import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { useAuth } from '../../hooks/useAuth';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { Heart, ShoppingCart, Trash2, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePolling } from '../../hooks/usePolling';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);
  const { isCustomer } = useAuth();

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);
  usePolling(() => dispatch(fetchWishlist()));

  const handleRemove = (foodItemId) => {
    dispatch(removeFromWishlist(foodItemId))
      .unwrap()
      .then(() => toast.success('Removed from wishlist'))
      .catch((err) => toast.error(err));
  };

  const handleAddToCart = (foodItemId) => {
    dispatch(addToCart({ foodItemId, quantity: 1 }))
      .unwrap()
      .then(() => toast.success('Added to cart! 🛒'))
      .catch((err) => toast.error(err));
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 mb-10" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shadow-sm">
                <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                My Wishlist
              </h1>
            </div>
            <p className="text-sm mt-3 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Your curated list of delicious favorites
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary-light)] self-start md:self-auto">
            {items.length} Saved {items.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {loading && items.length === 0 ? (
          <div className="py-24">
            <LoadingSpinner text="Loading wishlist..." />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon="💜"
              title="Your wishlist is empty"
              description="Save your favorite dishes here to order them later."
              action={
                <Link to="/restaurants">
                  <Button className="font-bold flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" /> Browse Restaurants
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={
                      item.foodItemImageUrl ||
                      '/images/default-food.jpg'
                    }
                    alt={item.foodItemName}
                    className="w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform"
                  />
                  {(!item.available || !item.restaurantActive) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs">
                      <span className="text-white text-xs font-extrabold tracking-wider uppercase px-3 py-1 bg-red-600 rounded-full">
                        {!item.restaurantActive ? 'Restaurant closed' : 'Unavailable'}
                      </span>
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.foodItemId)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer hover:bg-white"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-primary)]">
                      {item.restaurantName}
                    </span>
                    <h4
                      className="font-bold text-base truncate mt-0.5"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {item.foodItemName}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-lg font-black" style={{ color: 'var(--color-text-primary)' }}>
                      {formatCurrency(item.foodItemPrice)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(item.foodItemId)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                      {item.available && isCustomer && (
                        <Button
                          size="sm"
                          disabled={!item.restaurantActive}
                          onClick={() => handleAddToCart(item.foodItemId)}
                          className="flex items-center gap-1 font-bold rounded-xl px-4 py-2"
                        >
                          {item.restaurantActive && <ShoppingCart className="w-3.5 h-3.5" />}
                          {item.restaurantActive ? 'Add' : 'Closed'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WishlistPage;
