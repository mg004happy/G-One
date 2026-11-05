/**
 * Food Item Redux slice.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import foodService from '../../services/foodService';
import searchService from '../../services/searchService';

// ---- Async Thunks ----

export const fetchAllFoods = createAsyncThunk(
  'foods/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await foodService.getAll();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFoodById = createAsyncThunk(
  'foods/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await foodService.getById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFoodsByRestaurant = createAsyncThunk(
  'foods/fetchByRestaurant',
  async (restaurantId, { rejectWithValue }) => {
    try {
      return await foodService.getByRestaurant(restaurantId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTrendingFoods = createAsyncThunk(
  'foods/fetchTrending',
  async (limit = 10, { rejectWithValue }) => {
    try {
      return await searchService.getTrendingFoods(limit);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---- Slice ----

const foodSlice = createSlice({
  name: 'foods',
  initialState: {
    foods: [],
    foodsByRestaurant: [],
    foodsByRestaurantLoaded: false,
    trendingFoods: [],
    selectedFood: null,
    loading: false,
    error: null,
  },
  reducers: {
    setFoodAvailability: (state, action) => {
      const item = state.foodsByRestaurant.find((food) => food.id === action.payload.id);
      if (item) item.available = action.payload.available;
    },
    clearSelectedFood: (state) => {
      state.selectedFood = null;
    },
    clearFoodsByRestaurant: (state) => {
      state.foodsByRestaurant = [];
      state.foodsByRestaurantLoaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFoods.pending, (state) => {
        if (state.foods.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.foods = action.payload;
      })
      .addCase(fetchAllFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFoodById.pending, (state) => {
        if (!state.selectedFood) state.loading = true;
      })
      .addCase(fetchFoodById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFood = action.payload;
      })
      .addCase(fetchFoodById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFoodsByRestaurant.pending, (state) => {
        if (!state.foodsByRestaurantLoaded) state.loading = true;
      })
      .addCase(fetchFoodsByRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.foodsByRestaurantLoaded = true;
        state.foodsByRestaurant = action.payload;
      })
      .addCase(fetchFoodsByRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrendingFoods.fulfilled, (state, action) => {
        state.trendingFoods = action.payload;
      });
  },
});

export const { setFoodAvailability, clearSelectedFood, clearFoodsByRestaurant } = foodSlice.actions;
export default foodSlice.reducer;
