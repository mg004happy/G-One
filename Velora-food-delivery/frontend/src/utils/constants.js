/**
 * Application-wide constants.
 */

// API base — in dev, Vite proxy forwards /api → localhost:8080
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// User roles (match backend Role enum)
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  RESTAURANT_OWNER: 'RESTAURANT_OWNER',
};


// Food categories (match backend Category enum)
export const CATEGORIES = [
  { value: 'PIZZA', label: 'Pizza', image: '/images/categories/pizza.jpg' },
  { value: 'BURGER', label: 'Burger', image: '/images/categories/burger.jpg' },
  { value: 'DRINK', label: 'Drinks', image: '/images/categories/drink.jpg' },
  { value: 'DESSERT', label: 'Dessert', image: '/images/categories/dessert.jpg' },
  { value: 'INDIAN', label: 'Indian', image: '/images/categories/indian.jpg' },
  { value: 'CHINESE', label: 'Chinese', image: '/images/categories/chinese.jpg' },
  { value: 'SOUTH_INDIAN', label: 'South Indian', image: '/images/categories/south_indian.jpg' },
  { value: 'CAKE', label: 'Cake', image: '/images/categories/cake.jpg' },
  { value: 'ROLLS', label: 'Rolls', image: '/images/categories/rolls.jpg' },
  { value: 'NOODLES', label: 'Noodles', image: '/images/categories/noodles.jpg' },
  { value: 'COFFEE', label: 'Coffee', image: '/images/categories/coffee.jpg' },
  { value: 'HEALTHY', label: 'Healthy', image: '/images/categories/healthy.jpg' },
];

// Order statuses (match backend OrderStatus enum)
export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// Payment methods (match backend PaymentMethod enum)
export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  ONLINE_PAYMENT: 'ONLINE_PAYMENT',
};

// Payment statuses (match backend PaymentStatus enum)
export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
};

// Account statuses
export const ACCOUNT_STATUSES = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
  SUSPENDED: 'SUSPENDED',
};

// Address types (match backend AddressType enum)
export const ADDRESS_TYPES = {
  HOME: 'HOME',
  WORK: 'WORK',
  OTHER: 'OTHER',
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'fd_token',
  USER: 'fd_user',
  THEME: 'fd_theme',
};
