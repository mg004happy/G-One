import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, loginUser, registerUser, logout, clearError } from '../store/slices/authSlice';
import { ROLES } from '../utils/constants';

/**
 * Custom hook for authentication state and actions.
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const login = useCallback((credentials) => dispatch(loginUser(credentials)), [dispatch]);
  const register = useCallback((userData) => dispatch(registerUser(userData)), [dispatch]);
  const signOut = useCallback(() => dispatch(logout()), [dispatch]);
  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    ...auth,
    isCustomer: auth.user?.role === ROLES.CUSTOMER,
    isAdmin: auth.user?.role === ROLES.ADMIN,
    isOwner: auth.user?.role === ROLES.RESTAURANT_OWNER,
    login,
    register,
    logout: signOut,
    clearError: clearAuthError,
  };
};
