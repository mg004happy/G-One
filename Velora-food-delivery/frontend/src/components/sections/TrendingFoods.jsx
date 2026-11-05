import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrendingFoods } from '../../store/slices/foodSlice';
import { addToCart } from '../../store/slices/cartSlice';
import FoodCard from '../cards/FoodCard';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { usePolling } from '../../hooks/usePolling';

const TrendingFoods = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trendingFoods } = useSelector((state) => state.foods);
  const { isAuthenticated, isCustomer } = useAuth();

  useEffect(() => {
    dispatch(fetchTrendingFoods(8));
  }, [dispatch]);
  usePolling(() => dispatch(fetchTrendingFoods(8)));

  const handleAddToCart = (data) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (!isCustomer) {
      toast.error('Only customers can add items to cart');
      return;
    }
    dispatch(addToCart(data))
      .unwrap()
      .then(() => toast.success('Added to cart! 🛒'))
      .catch((err) => toast.error(err));
  };

  if (!trendingFoods || trendingFoods.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>
            🔥 Trending Now
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Most ordered dishes this week
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {trendingFoods.slice(0, 8).map((food) => (
            <FoodCard key={food.id} food={food} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingFoods;
