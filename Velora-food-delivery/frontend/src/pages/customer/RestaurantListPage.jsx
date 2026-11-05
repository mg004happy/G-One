import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurants, searchRestaurants } from '../../store/slices/restaurantSlice';
import { addToCart } from '../../store/slices/cartSlice';
import MainLayout from '../../layouts/MainLayout';
import RestaurantCard from '../../components/cards/RestaurantCard';
import FoodCard from '../../components/cards/FoodCard';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { SlidersHorizontal, Star } from 'lucide-react';
import { usePolling } from '../../hooks/usePolling';
import searchService from '../../services/searchService';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const RestaurantListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const { restaurants, searchResults, loading } = useSelector((state) => state.restaurants);
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [minRating, setMinRating] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryResult, setCategoryResult] = useState({ category: '', foods: [] });
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (category) {
      searchService.searchFoods({ category, page: 0, size: 100 })
        .then((result) => {
          const foods = result?.content || result || [];
          setCategoryResult({ category, foods });
        })
        .catch(() => setCategoryResult({ category, foods: [] }));
    } else if (debouncedSearch || minRating) {
      const params = {};
      if (debouncedSearch) params.keyword = debouncedSearch;
      if (minRating) params.minRating = minRating;
      dispatch(searchRestaurants(params));
    } else {
      dispatch(fetchRestaurants());
    }
  }, [dispatch, debouncedSearch, minRating, category]);

  usePolling(() => {
    if (category) {
      searchService.searchFoods({ category, size: 100 })
        .then((result) => setCategoryResult({ category, foods: result?.content || result || [] }))
        .catch(() => setCategoryResult({ category, foods: [] }));
    } else if (debouncedSearch || minRating) {
      const params = {};
      if (debouncedSearch) params.keyword = debouncedSearch;
      if (minRating) params.minRating = minRating;
      dispatch(searchRestaurants(params));
    } else {
      dispatch(fetchRestaurants());
    }
  });

  const displayData = (debouncedSearch || minRating) ? (searchResults?.content || searchResults || []) : restaurants;
  const activeRestaurants = Array.isArray(displayData)
    ? displayData.filter((restaurant) => restaurant.active && restaurant.approved)
    : [];
  const handleAddToCart = (data) => {
    if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return; }
    if (!isCustomer) { toast.error('Only customers can add to cart'); return; }
    dispatch(addToCart(data)).unwrap()
      .then(() => toast.success('Added to cart! 🛒'))
      .catch((error) => toast.error(error));
  };
  const categoryLabel = CATEGORIES.find((item) => item.value === category)?.label || category.replaceAll('_', ' ');
  const categoryFoods = categoryResult.category === category ? categoryResult.foods : [];
  const availableCategoryFoods = categoryFoods.filter((food) => food.available !== false && food.restaurantActive !== false);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              {category ? `${categoryLabel} Dishes` : 'All Restaurants'}
            </h1>
            <p className="text-sm mt-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {category ? `Explore all available ${categoryLabel.toLowerCase()} menu items` : 'Discover the finest dining and quick bites around you'}
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary-light)] self-start md:self-auto">
            {category ? `${availableCategoryFoods.length} dishes` : `${activeRestaurants.length} spots open`}
          </span>
        </div>

        {/* Search + Filters */}
        {!category && <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar
              placeholder="Search restaurants, cuisines, or dishes..."
              onSearch={setSearchQuery}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-95"
            style={{
              backgroundColor: showFilters ? 'var(--color-primary-light)' : 'var(--color-surface)',
              border: `1.5px solid ${showFilters ? 'var(--color-primary)' : 'var(--color-border)'}`,
              color: showFilters ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>}

        {/* Filter Panel */}
        {!category && showFilters && (
          <div
            className="mb-8 p-6 rounded-3xl animate-fade-in shadow-sm relative overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-primary)]" />
            <h3 className="font-bold text-sm mb-4 tracking-wide uppercase text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Minimum Rating
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {[null, 3, 3.5, 4, 4.5].map((r) => {
                const isActive = minRating === r;
                return (
                  <button
                    key={r ?? 'all'}
                    onClick={() => setMinRating(r)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                    style={{
                      backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                      color: isActive ? 'white' : 'var(--color-text-secondary)',
                      boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                    }}
                  >
                    {r ? (
                      <>
                        <Star className={`w-3.5 h-3.5 ${isActive ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                        <span>{r}+ Star</span>
                      </>
                    ) : (
                      'All Ratings'
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {category ? (categoryResult.category !== category ? (
          <div className="py-24"><LoadingSpinner text={`Finding ${categoryLabel.toLowerCase()} dishes...`} /></div>
        ) : availableCategoryFoods.length === 0 ? (
          <div className="py-16"><EmptyState icon="🍽️" title={`No ${categoryLabel.toLowerCase()} dishes found`} description="There are no available menu items in this category right now." /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {availableCategoryFoods.map((food) => (
              <FoodCard key={food.id} food={food} onAddToCart={handleAddToCart} showRestaurantName />
            ))}
          </div>
        )) : loading ? (
          <div className="py-24">
            <LoadingSpinner text="Finding restaurants..." />
          </div>
        ) : activeRestaurants.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon="🍽️"
              title="No restaurants found"
              description="We couldn't find any matches. Try adjusting your search query or filters."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {activeRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RestaurantListPage;
