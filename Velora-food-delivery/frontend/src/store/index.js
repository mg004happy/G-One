import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import restaurantReducer from './slices/restaurantSlice';
import foodReducer from './slices/foodSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import addressReducer from './slices/addressSlice';
import uiReducer from './slices/uiSlice';
import paymentReducer from './slices/paymentSlice';
import wishlistReducer from './slices/wishlistSlice';
import adminReducer from './slices/adminSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    foods: foodReducer,
    cart: cartReducer,
    orders: orderReducer,
    addresses: addressReducer,
    ui: uiReducer,
    payment: paymentReducer,
    wishlist: wishlistReducer,
    admin: adminReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
