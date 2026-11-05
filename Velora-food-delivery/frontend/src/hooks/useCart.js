import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, updateCartItem, removeCartItem, clearCart, fetchCart, selectCart, selectCartItemCount } from '../store/slices/cartSlice';

/**
 * Custom hook for cart operations.
 */
export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const itemCount = useSelector(selectCartItemCount);
  const { loading, error } = useSelector((state) => state.cart);
  const fetchCartData = useCallback(() => dispatch(fetchCart()), [dispatch]);

  return {
    cart,
    itemCount,
    loading,
    error,
    fetchCart: fetchCartData,
    addItem: (data) => dispatch(addToCart(data)),
    updateItem: (cartItemId, data) => dispatch(updateCartItem({ cartItemId, data })),
    removeItem: (cartItemId) => dispatch(removeCartItem(cartItemId)),
    clear: () => dispatch(clearCart()),
  };
};
