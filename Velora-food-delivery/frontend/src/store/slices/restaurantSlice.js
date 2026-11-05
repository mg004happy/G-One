/**
 * Restaurant Redux slice.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import restaurantService from '../../services/restaurantService';
import searchService from '../../services/searchService';

// ---- Async Thunks ----

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await restaurantService.getAll();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRestaurantBySlug = createAsyncThunk(
  'restaurants/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return await restaurantService.getBySlug(slug);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTopRestaurants = createAsyncThunk(
  'restaurants/fetchTop',
  async (limit = 10, { rejectWithValue }) => {
    try {
      return await searchService.getTopRestaurants(limit);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchRestaurants = createAsyncThunk(
  'restaurants/search',
  async (params, { rejectWithValue }) => {
    try {
      return await searchService.searchRestaurants(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---- Slice ----

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState: {
    restaurants: [],
    restaurantsLoaded: false,
    topRestaurants: [],
    selectedRestaurant: null,
    searchResults: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchRestaurants.pending, (state) => {
        if (!state.restaurantsLoaded) state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurantsLoaded = true;
        state.restaurants = action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRestaurantBySlug.pending, (state) => {
        if (!state.selectedRestaurant) state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRestaurant = action.payload;
      })
      .addCase(fetchRestaurantBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (String(action.payload || '').toLowerCase().includes('not found')) {
          state.selectedRestaurant = null;
        }
      })
      // fetchTop
      .addCase(fetchTopRestaurants.fulfilled, (state, action) => {
        state.topRestaurants = action.payload;
      })
      // search
      .addCase(searchRestaurants.pending, (state) => {
        if (!state.searchResults) state.loading = true;
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedRestaurant, clearSearchResults } = restaurantSlice.actions;
export default restaurantSlice.reducer;
