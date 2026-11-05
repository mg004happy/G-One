/**
 * Cart Redux slice.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';

// ---- Async Thunks ----

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.getCart();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async (data, { rejectWithValue }) => {
    try {
      return await cartService.addToCart(data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ cartItemId, data }, { rejectWithValue }) => {
    try {
      return await cartService.updateItem(cartItemId, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (cartItemId, { rejectWithValue }) => {
    try {
      return await cartService.removeItem(cartItemId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---- Slice ----

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetCart: (state) => {
      state.cart = null;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => {
      state.loading = true;
      state.error = null;
    };
    const setError = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    const setCart = (state, action) => {
      state.loading = false;
      state.cart = action.payload;
    };

    builder
      .addCase(fetchCart.pending, setLoading)
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, setError)
      .addCase(addToCart.pending, setLoading)
      .addCase(addToCart.fulfilled, setCart)
      .addCase(addToCart.rejected, setError)
      .addCase(updateCartItem.pending, setLoading)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(updateCartItem.rejected, setError)
      .addCase(removeCartItem.pending, setLoading)
      .addCase(removeCartItem.fulfilled, setCart)
      .addCase(removeCartItem.rejected, setError)
      .addCase(clearCart.pending, setLoading)
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.cart = null;
      })
      .addCase(clearCart.rejected, setError);
  },
});

export const { resetCart } = cartSlice.actions;

export const selectCart = (state) => state.cart.cart;
export const selectCartItemCount = (state) => state.cart.cart?.totalItems || 0;

export default cartSlice.reducer;
