/**
 * Wishlist API service — maps to WishlistController.
 */
import api from '../api/axios';

const URL = '/api/wishlist';

const wishlistService = {
  getMyWishlist: () => api.get(URL).then((r) => r.data),

  add: (foodItemId) => api.post(`${URL}/${foodItemId}`).then((r) => r.data),

  remove: (foodItemId) => api.delete(`${URL}/${foodItemId}`),
};

export default wishlistService;
