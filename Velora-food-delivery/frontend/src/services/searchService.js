/**
 * Search & Recommendations API service — maps to SearchController.
 */
import api from '../api/axios';

const searchService = {
  /**
   * Search restaurants by keyword, minRating, with pagination.
   */
  searchRestaurants: (params = {}) =>
    api.get('/api/search/restaurants', { params }).then((r) => r.data),

  /**
   * Search food items with filters: keyword, category, veg, minPrice, maxPrice.
   */
  searchFoods: (params = {}) =>
    api.get('/api/search/foods', { params }).then((r) => r.data),

  /**
   * Get top-rated restaurants.
   */
  getTopRestaurants: (limit = 10) =>
    api.get('/api/recommendations/top-restaurants', { params: { limit } }).then((r) => r.data),

  /**
   * Get trending (most ordered) food items.
   */
  getTrendingFoods: (limit = 10) =>
    api.get('/api/recommendations/trending-foods', { params: { limit } }).then((r) => r.data),
};

export default searchService;
