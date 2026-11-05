/**
 * Order Redux slice.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';

// ---- Async Thunks ----

export const placeOrder = createAsyncThunk(
  'orders/place',
  async (data, { rejectWithValue }) => {
    try {
      return await orderService.placeOrder(data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getMyOrders();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.getById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.cancel(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await orderService.updateStatus(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---- Slice ----

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    myOrdersLoaded: false,
    selectedOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // placeOrder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.selectedOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchMyOrders
      .addCase(fetchMyOrders.pending, (state) => {
        if (!state.myOrdersLoaded) state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrdersLoaded = true;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchById
      .addCase(fetchOrderById.pending, (state) => {
        if (!state.selectedOrder) state.loading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // cancel
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) state.orders[index] = action.payload;
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      })
      // updateStatus (owner)
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) state.orders[index] = action.payload;
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      });
  },
});

export const { clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
