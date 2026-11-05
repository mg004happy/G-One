import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, Star, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../common/Button';
import searchService from '../../services/searchService';
import { slugify } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import { CATEGORIES } from '../../utils/constants';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ restaurants: [], foods: [], categories: [] });
  const [resolvedQuery, setResolvedQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 250);
  const navigate = useNavigate();

  useEffect(() => {
    const keyword = debouncedQuery.trim();
    if (keyword.length < 2) return undefined;

    let cancelled = false;
    Promise.allSettled([
      searchService.searchRestaurants({ keyword, size: 6 }),
      searchService.searchFoods({ keyword, size: 6 }),
    ])
      .then(([restaurantResult, foodResult]) => {
        if (cancelled) return;
        const restaurantResults = restaurantResult.status === 'fulfilled' ? restaurantResult.value : [];
        const foodResults = foodResult.status === 'fulfilled' ? foodResult.value : [];
        setSuggestions({
          restaurants: restaurantResults?.content || restaurantResults || [],
          foods: foodResults?.content || foodResults || [],
          categories: CATEGORIES.filter((category) => category.label.toLowerCase().includes(keyword.toLowerCase())),
        });
        setResolvedQuery(keyword);
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions({ restaurants: [], foods: [], categories: CATEGORIES.filter((category) => category.label.toLowerCase().includes(keyword.toLowerCase())) });
          setResolvedQuery(keyword);
        }
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const hasSearchTerm = searchQuery.trim().length >= 2;
  const showSuggestions = searchFocused && hasSearchTerm;

  const openRestaurant = (name, id) => {
    setSearchFocused(false);
    navigate(`/restaurants/${slugify(name) || id}`);
  };

  const openCategory = (category) => {
    setSearchFocused(false);
    navigate(`/restaurants?category=${encodeURIComponent(category.value)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative z-20 isolate overflow-x-clip bg-gradient-hero">
      <div className="pointer-events-none absolute -right-24 top-4 h-80 w-80 rounded-full bg-[var(--color-secondary)]/10 blur-3xl md:h-[30rem] md:w-[30rem]" />
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-2 lg:px-8 lg:py-12">
        <div className="relative z-10 animate-fade-in-up lg:py-8">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--color-text-secondary)' }}>
            <Sparkles className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            Your cravings, guided by good taste
          </div>
          <h1 className="mb-5 max-w-2xl text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.5rem]" style={{ color: 'var(--color-text-primary)' }}>
            Delicious food<br />for <span style={{ color: 'var(--color-primary)' }}>every mood.</span>
          </h1>
          <p className="mb-7 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Discover loved local restaurants, find your next favorite dish, and bring a little joy to the table.
          </p>

          <div className="relative max-w-xl">
            <form onSubmit={handleSearch} className="flex flex-col items-stretch gap-2 rounded-[1.75rem] p-1.5 shadow-lg sm:flex-row sm:items-center sm:rounded-full" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="relative flex min-h-12 min-w-0 flex-1 items-center">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--color-primary)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={(event) => {
                    if (!event.relatedTarget?.closest('[data-search-suggestions]')) setSearchFocused(false);
                  }}
                  placeholder="Search restaurants, dishes, cuisines..."
                  aria-label="Search restaurants and dishes"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                  className="w-full rounded-full bg-transparent py-3 pl-12 pr-4 text-sm outline-none focus-visible:outline-none focus-visible:ring-0 sm:py-3.5"
                  style={{ color: 'var(--color-text-primary)', outline: 'none' }}
                />
              </div>
              <Button type="submit" className="h-12 w-full shrink-0 rounded-[9999px] px-7 sm:w-auto">
                Search <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {showSuggestions && (
              <div data-search-suggestions className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[min(70vh,32rem)] overflow-y-auto rounded-2xl p-2 shadow-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                {resolvedQuery !== searchQuery.trim() ? (
                  <div className="flex items-center justify-center gap-3 p-5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-primary)' }} /> Searching...
                  </div>
                ) : suggestions.restaurants.length === 0 && suggestions.foods.length === 0 && suggestions.categories.length === 0 ? (
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setSearchFocused(false); navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`); }} className="w-full rounded-xl p-3 text-left text-sm hover:bg-[var(--color-bg-tertiary)]" style={{ color: 'var(--color-text-secondary)' }}>
                    Search all restaurants for “{searchQuery.trim()}”
                  </button>
                ) : (
                  <>
                    {suggestions.categories.length > 0 && (
                      <SuggestionGroup title="Food categories">
                        {suggestions.categories.map((category) => (
                          <SuggestionOption
                            key={`category-${category.value}`}
                            title={category.label}
                            subtitle="Food category"
                            image={category.image}
                            onSelect={() => openCategory(category)}
                          />
                        ))}
                      </SuggestionGroup>
                    )}
                    {suggestions.restaurants.length > 0 && (
                      <SuggestionGroup title="Restaurants">
                        {suggestions.restaurants.map((restaurant) => (
                          <SuggestionOption
                            key={`restaurant-${restaurant.id}`}
                            title={restaurant.name}
                            subtitle={restaurant.address || 'Restaurant'}
                            image={restaurant.imageUrl}
                            onSelect={() => openRestaurant(restaurant.name, restaurant.id)}
                          />
                        ))}
                      </SuggestionGroup>
                    )}
                    {suggestions.foods.length > 0 && (
                      <SuggestionGroup title="Dishes">
                        {suggestions.foods.map((food) => (
                          <SuggestionOption
                            key={`food-${food.id}`}
                            title={food.name}
                            subtitle={food.restaurantName || food.category || 'Menu item'}
                            image={food.imageUrl}
                            onSelect={() => openRestaurant(food.restaurantName, food.restaurantId)}
                          />
                        ))}
                      </SuggestionGroup>
                    )}
                    <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setSearchFocused(false); navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`); }} className="mt-1 w-full rounded-xl border-t px-3 py-3 text-left text-sm font-semibold hover:bg-[var(--color-bg-tertiary)]" style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-primary)' }}>
                      See all results for “{searchQuery.trim()}” <ArrowRight className="ml-1 inline h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

        </div>

        <div className="relative mx-auto w-full max-w-xl animate-fade-in lg:ml-auto">
          <div className="absolute -left-6 top-1/2 h-3/4 w-[110%] -translate-y-1/2 rotate-[-13deg] rounded-[50%] border-2 border-[var(--color-primary)]/35" />
          <div className="relative h-[17rem] overflow-hidden rounded-[2rem] shadow-xl sm:h-[23rem] lg:h-[27rem] lg:rounded-[2.75rem]">
            <img src="/images/hero-food.jpg" alt="A spread of freshly grilled food and sauces" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </div>
          <div className="absolute -left-2 top-5 flex items-center gap-3 rounded-2xl p-3 shadow-lg sm:-left-8 sm:top-10 sm:p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}><Star className="h-4 w-4 fill-current" /></span>
            <span><strong className="block text-sm" style={{ color: 'var(--color-primary-dark)' }}>Velora’s pick</strong><small style={{ color: 'var(--color-text-secondary)' }}>Something delicious awaits</small></span>
          </div>
          <div className="absolute -bottom-3 right-2 flex h-24 w-24 items-center justify-center rounded-full px-3 text-center font-semibold leading-tight shadow-lg sm:-right-5 sm:h-28 sm:w-28" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary-dark)', border: '1px solid var(--color-border)' }}>
            Good food,<br />brighter days
          </div>
          <Sparkles className="absolute -right-2 top-3 h-7 w-7" style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
    </section>
  );
};

const SuggestionGroup = ({ title, children }) => (
  <div className="py-1">
    <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{title}</p>
    <div>{children}</div>
  </div>
);

const SuggestionOption = ({ title, subtitle, image, onSelect }) => (
  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={onSelect} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-[var(--color-bg-tertiary)]">
    <img src={image || '/images/default-food.jpg'} alt="" className="h-10 w-10 rounded-lg object-cover" />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</span>
      <span className="block truncate text-xs" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</span>
    </span>
    <ArrowRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
  </button>
);

export default HeroSection;
