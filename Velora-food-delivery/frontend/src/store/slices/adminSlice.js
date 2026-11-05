/**
 * Admin Redux slice — maps to AdminController.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';

// ---- Async Thunks ----

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getDashboardStats();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await adminService.getUsers(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await adminService.updateUserStatus(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminRestaurants = createAsyncThunk(
  'admin/fetchRestaurants',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      return await adminService.getRestaurants(page, size);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await adminService.getOrders(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderAnalytics = createAsyncThunk(
  'admin/fetchOrderAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getOrderAnalytics();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk(
  'admin/fetchRevenueAnalytics',
  async (days = 30, { rejectWithValue }) => {
    try {
      return await adminService.getRevenueAnalytics(days);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---- Slice ----

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: null,
    restaurants: null,
    orders: null,
    orderAnalytics: null,
    revenueAnalytics: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminState: (state) => {
      state.stats = null;
      state.users = null;
      state.restaurants = null;
      state.orders = null;
      state.orderAnalytics = null;
      state.revenueAnalytics = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateUserStatus
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        if (state.users?.content) {
          const idx = state.users.content.findIndex((u) => u.id === action.payload.id);
          if (idx !== -1) state.users.content[idx] = action.payload;
        }
      })
      // restaurants
      .addCase(fetchAdminRestaurants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
      })
      .addCase(fetchAdminRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // orderAnalytics
      .addCase(fetchOrderAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.orderAnalytics = action.payload;
      })
      .addCase(fetchOrderAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // revenueAnalytics
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueAnalytics = action.payload;
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
