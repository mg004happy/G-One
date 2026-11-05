import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearSelectedRestaurant, fetchRestaurantBySlug } from '../../store/slices/restaurantSlice';
import { fetchFoodsByRestaurant } from '../../store/slices/foodSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { useAuth } from '../../hooks/useAuth';
import MainLayout from '../../layouts/MainLayout';
import FoodCard from '../../components/cards/FoodCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchBar from '../../components/common/SearchBar';
import { Star, Clock, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { formatTime, slugify } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePolling } from '../../hooks/usePolling';

const RestaurantDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedRestaurant: restaurant, loading } = useSelector((state) => state.restaurants);
  const { foodsByRestaurant: foods } = useSelector((state) => state.foods);
  const { isAuthenticated, isCustomer } = useAuth();
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadRestaurant = useCallback(async () => {
    try {
      const loadedRestaurant = await dispatch(fetchRestaurantBySlug(slug)).unwrap();
      const canonicalSlug = slugify(loadedRestaurant.name);
      if (canonicalSlug && slug !== canonicalSlug) {
        navigate(`/restaurants/${canonicalSlug}`, { replace: true });
      }
      dispatch(fetchFoodsByRestaurant(loadedRestaurant.id));
    } catch (error) {
      if (String(error).toLowerCase().includes('not found')) {
        toast.error('This restaurant is closed or unavailable.');
        navigate('/restaurants', { replace: true });
      }
    }
  }, [dispatch, slug, navigate]);

  useEffect(() => {
    dispatch(clearSelectedRestaurant());
    loadRestaurant();
  }, [dispatch, loadRestaurant]);
  usePolling(loadRestaurant);

  const handleAddToCart = (data) => {
    if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return; }
    if (!isCustomer) { toast.error('Only customers can add to cart'); return; }
    dispatch(addToCart(data))
      .unwrap()
      .then(() => toast.success('Added to cart! 🛒'))
      .catch((err) => toast.error(err));
  };

  const filteredFoods = foods.filter((f) => {
    const matchCat = !activeCategory || f.category === activeCategory;
    const matchSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const uniqueCategories = [...new Set(foods.map((f) => f.category).filter(Boolean))];

  if (loading && !restaurant) return <MainLayout><LoadingSpinner text="Loading restaurant..." /></MainLayout>;
  if (!restaurant) return <MainLayout><div className="py-20 text-center" style={{ color: 'var(--color-text-secondary)' }}>Restaurant not found</div></MainLayout>;

  return (
    <MainLayout>
      {/* Header Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <div className="absolute top-6 left-6 z-10">
          <Link 
            to="/restaurants" 
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all text-xs font-bold backdrop-blur-md border border-white/10 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Restaurants
          </Link>
        </div>
        <img
          src={restaurant.imageUrl || '/images/default-restaurant.jpg'}
          alt={restaurant.name}
          className="w-full h-full object-cover bg-gray-200 transform scale-105 hover:scale-110 duration-1000 transition-transform"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/default-restaurant.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent" />
        
        {/* Info Overlay (SaaS Glassmorphic Style) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <div className="p-6 md:p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-xl bg-black/30 text-white max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[var(--color-primary)] text-white">
                Partnered
              </span>
              {restaurant.averageRating > 0 && (
                <div className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full text-xs font-bold border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{restaurant.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{restaurant.name}</h1>
            <p className="text-zinc-200/90 text-sm leading-relaxed mb-6 font-medium">{restaurant.description}</p>
            
            <div className="flex flex-wrap gap-y-3 gap-x-5 text-xs font-semibold text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                <span>{formatTime(restaurant.openingTime)} - {formatTime(restaurant.closingTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="line-clamp-1">{restaurant.address}</span>
              </div>
              {restaurant.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b pb-6" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Explore Menu
          </h2>
          <div className="w-full md:w-96">
            <SearchBar placeholder="Search menu items..." onSearch={setSearchQuery} />
          </div>
        </div>

        {/* Category Tabs */}
        {uniqueCategories.length > 0 && (
          <div className="flex gap-2.5 mb-10 overflow-x-auto pb-3 scrollbar-thin">
            <button
              onClick={() => setActiveCategory(null)}
              className="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
              style={{
                backgroundColor: !activeCategory ? 'var(--color-primary)' : 'var(--color-surface)',
                color: !activeCategory ? 'white' : 'var(--color-text-secondary)',
                border: !activeCategory ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                boxShadow: !activeCategory ? 'var(--shadow-glow)' : 'none',
              }}
            >
              All ({foods.length})
            </button>
            {uniqueCategories.map((cat) => {
              const catInfo = CATEGORIES.find((c) => c.value === cat);
              const count = foods.filter((f) => f.category === cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                    border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                  }}
                >
                  <span className="mr-1">{catInfo?.emoji || '🍽️'}</span>
                  <span>{catInfo?.label || cat}</span>
                  <span className="ml-1.5 text-xs opacity-75 font-semibold">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Food Grid */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
            Showing {filteredFoods.length} dish{filteredFoods.length !== 1 ? 'es' : ''}
          </p>
        </div>
        {filteredFoods.length === 0 ? (
          <div className="text-center py-20 rounded-3xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span className="text-3xl mb-3 block">🔍</span>
            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--color-text-primary)' }}>No dishes found</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Try searching for a different dish name or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={{ ...food, restaurantTieUpCompanies: restaurant.tieUpCompanies || food.restaurantTieUpCompanies || [] }}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RestaurantDetailPage;
