/**
 * Wishlist Redux slice — maps to WishlistController.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../../services/wishlistService';

// ---- Async Thunks ----

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await wishlistService.getMyWishlist();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (foodItemId, { rejectWithValue }) => {
    try {
      return await wishlistService.add(foodItemId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (foodItemId, { rejectWithValue }) => {
    try {
      await wishlistService.remove(foodItemId);
      return foodItemId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---- Slice ----

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // add
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // remove
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.foodItemId !== action.payload);
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export const selectWishlistIds = (state) =>
  state.wishlist.items.map((item) => item.foodItemId);
export default wishlistSlice.reducer;
